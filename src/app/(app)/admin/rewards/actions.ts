"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { currentPlanYear } from "@/lib/utils";
import { audit } from "@/server/audit";
import { notify } from "@/server/push";

function done(notice: string, anchor = ""): never {
  revalidatePath("/", "layout");
  redirect(`/admin/rewards?notice=${notice}${anchor}`);
}

const intOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

// ── Redemptions ──────────────────────────────────────────────────────────────

export async function setRedemptionStatus(id: number, status: "fulfilled" | "cancelled", formData: FormData) {
  const admin = await requireAdmin();
  const r = await db.rewardRedemption.findUnique({ where: { id: Number(id) } });
  if (!r || r.status !== "pending") done("stale", "#requests");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const details = { ...(r.details ? JSON.parse(r.details) : {}), ...(note ? { adminNote: note } : {}), handledBy: admin.name };
  await db.rewardRedemption.update({
    where: { id: r.id },
    data: { status, fulfilledAt: status === "fulfilled" ? new Date() : null, details: JSON.stringify(details) },
  });
  await audit(admin.id, `redemption.${status}`, "reward_redemption", r.id, { userId: r.userId, note: note || undefined });
  if (status === "fulfilled") {
    await notify([r.userId], { title: "Your reward is on its way", body: note || "Your reward request has been fulfilled.", url: "/rewards", tag: "reward" }, "account");
  }
  done(status, "#requests");
}

// ── Tiers ────────────────────────────────────────────────────────────────────

export async function saveTier(id: number | null, formData: FormData) {
  const admin = await requireAdmin();
  const label = String(formData.get("label") ?? "").trim().slice(0, 100);
  const reward = String(formData.get("reward") ?? "").trim().slice(0, 300);
  const threshold = intOrNull(formData.get("threshold"));
  if (!label || !reward || threshold == null || Number.isNaN(threshold) || threshold < 1) done("tier-invalid", "#tiers");
  const planYear = currentPlanYear();
  const row =
    id == null
      ? await db.rewardTier.create({ data: { planYear, label, reward, threshold, sortOrder: await db.rewardTier.count({ where: { planYear } }) } })
      : await db.rewardTier.update({ where: { id: Number(id) }, data: { label, reward, threshold } });
  await audit(admin.id, id == null ? "tier.create" : "tier.update", "reward_tier", row.id, { label, threshold });
  done("tier-saved", "#tiers");
}

/** Delete a tier nobody has requested; otherwise refuse (history would lose its tier). */
export async function deleteTier(id: number) {
  const admin = await requireAdmin();
  const used = await db.rewardRedemption.count({ where: { tierId: Number(id) } });
  if (used) done("tier-in-use", "#tiers");
  await db.rewardTier.delete({ where: { id: Number(id) } });
  await audit(admin.id, "tier.delete", "reward_tier", id);
  done("tier-deleted", "#tiers");
}

// ── Points rules ─────────────────────────────────────────────────────────────

/** Changes apply to points earned from now on; past awards stay as they were. */
export async function saveRule(id: number, formData: FormData) {
  const admin = await requireAdmin();
  const points = intOrNull(formData.get("points"));
  const maxPerDay = intOrNull(formData.get("maxPerDay"));
  const maxPerYear = intOrNull(formData.get("maxPerYear"));
  if (points == null || [points, maxPerDay, maxPerYear].some((n) => Number.isNaN(n)) || points > 5000) done("rule-invalid", "#rules");
  const isActive = formData.get("isActive") === "on";
  const before = await db.pointsRule.findUnique({ where: { id: Number(id) } });
  if (!before) done("stale", "#rules");
  await db.pointsRule.update({ where: { id: before.id }, data: { points, maxPerDay, maxPerYear, isActive } });
  await audit(admin.id, "rule.update", "points_rule", before.id, {
    slug: before.slug,
    from: { points: before.points, maxPerDay: before.maxPerDay, maxPerYear: before.maxPerYear, isActive: before.isActive },
    to: { points, maxPerDay, maxPerYear, isActive },
  });
  done("rule-saved", "#rules");
}

// ── Manual adjustments ───────────────────────────────────────────────────────

/** Add or remove points for one member, with a reason. Written as an "adjustment" ledger row. */
export async function adjustPoints(formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const points = Number(formData.get("points"));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!Number.isInteger(points) || points === 0 || Math.abs(points) > 5000 || !reason) done("adjust-invalid", "#adjust");
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) done("adjust-no-member", "#adjust");
  const today = programToday();
  const row = await db.pointsLedger.create({
    data: {
      userId: user.id,
      planYear: today.getUTCFullYear(),
      category: "adjustment",
      points,
      sourceType: "adjustment",
      // Unique per adjustment; the ledger key is (user, sourceType, sourceId).
      sourceId: `${admin.id}:${Date.now()}`,
      description: `Adjustment: ${reason}`,
      occurredOn: today,
    },
  });
  await audit(admin.id, "points.adjust", "points_ledger", row.id, { userId: user.id, points, reason });
  done("adjusted", "#adjust");
}
