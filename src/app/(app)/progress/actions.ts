"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { addDays, dateOnly, programToday } from "@/lib/dates";
import { ACTIVITY_BACKFILL_DAYS as BACKFILL_DAYS, MANUAL_DAILY_LIMIT, METRIC_META } from "@/lib/challenges";
import type { ChallengeMetric } from "@/lib/domain";
import { awardPoints } from "@/server/points";
import { recomputeProgress } from "@/server/challenges";
import { saveScreening } from "@/server/screenings";
import { checkMarker, MARKER_BY_KEY, MARKERS } from "@/lib/biometrics";

export type LogState = { error: string | null; ok: string | null };

const RULE_FOR_CATEGORY: Record<string, string> = { physical_activity: "physical-activity", nutrition: "nutrition" };

const LogInput = z.object({
  activityTypeId: z.coerce.number().int().positive("Choose an activity."),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  value: z.coerce.number({ error: "Enter an amount." }).positive("Enter an amount above zero."),
  notes: z.string().trim().max(500, "Keep notes under 500 characters.").optional(),
});

export async function logActivity(_prev: LogState, formData: FormData): Promise<LogState> {
  const user = await requireUser();
  const parsed = LogInput.safeParse({
    activityTypeId: formData.get("activityTypeId"),
    entryDate: formData.get("entryDate"),
    value: formData.get("value"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your entry.", ok: null };
  const { activityTypeId, value, notes } = parsed.data;

  const day = dateOnly(parsed.data.entryDate);
  const today = programToday();
  if (day > today) return { error: "You can't log a future date.", ok: null };
  if (day < addDays(today, -BACKFILL_DAYS)) return { error: `You can log up to ${BACKFILL_DAYS} days back.`, ok: null };

  const type = await db.activityType.findFirst({ where: { id: activityTypeId, isActive: true } });
  if (!type) return { error: "Choose an activity.", ok: null };
  const amount = type.metric === "distance_miles" ? Math.round(value * 100) / 100 : Math.round(value);
  if (amount <= 0) return { error: "Enter an amount above zero.", ok: null };

  if (type.metric === "steps") {
    const synced = await db.activityEntry.findFirst({
      where: { userId: user.id, entryDate: day, source: "device", activityType: { metric: "steps" } },
      select: { id: true },
    });
    if (synced) return { error: "Steps for that day come from your synced device, so they can't be typed in too.", ok: null };
  }

  // The limit covers the whole day, not each entry, so it can't be beaten by splitting.
  const max = MANUAL_DAILY_LIMIT[type.metric] ?? METRIC_META[type.metric as ChallengeMetric]?.dailyMax ?? 10_000;
  const { _sum } = await db.activityEntry.aggregate({
    where: { userId: user.id, entryDate: day, source: "manual", activityType: { metric: type.metric } },
    _sum: { value: true },
  });
  const already = Number(_sum.value?.toString() ?? 0);
  if (already + amount > max) {
    const left = Math.max(0, max - already);
    return {
      error:
        already > 0
          ? `You can log up to ${max.toLocaleString()} ${type.unit} a day and have ${already.toLocaleString()} already, so ${left.toLocaleString()} more at most.`
          : `You can log up to ${max.toLocaleString()} ${type.unit} a day. Check the amount.`,
      ok: null,
    };
  }

  const entry = await db.activityEntry.create({
    data: { userId: user.id, activityTypeId: type.id, entryDate: day, value: amount, source: "manual", notes: notes || null },
  });

  let earned = 0;
  const rule = RULE_FOR_CATEGORY[type.category];
  const points = Math.floor(amount * Number(type.pointsPerUnit.toString()));
  if (rule && points > 0) {
    earned = await awardPoints({
      userId: user.id,
      ruleSlug: rule,
      sourceType: "activity",
      sourceId: String(entry.id),
      description: `${type.name}: ${amount.toLocaleString()} ${type.unit}`,
      on: day,
      points,
    });
  }
  await recomputeProgress(user.id, day, day);

  revalidatePath("/", "layout");
  return {
    error: null,
    ok: `Logged ${amount.toLocaleString()} ${type.unit} of ${type.name.toLowerCase()}${earned ? ` · +${earned} pts` : points > 0 ? " · daily points limit reached" : ""}.`,
  };
}

/** Remove one of your own manual entries, its points, and its effect on challenges. */
export async function deleteActivity(entryId: number) {
  const user = await requireUser();
  const entry = await db.activityEntry.findFirst({ where: { id: Number(entryId), userId: user.id, source: "manual" } });
  if (!entry) return;
  await db.$transaction([
    db.activityEntry.delete({ where: { id: entry.id } }),
    db.pointsLedger.deleteMany({ where: { userId: user.id, sourceType: "activity", sourceId: String(entry.id) } }),
  ]);
  await recomputeProgress(user.id, entry.entryDate, entry.entryDate);
  revalidatePath("/", "layout");
}

// ── Health numbers ───────────────────────────────────────────────────────────

export type ScreeningState = { error: string | null; ok: string | null };

/**
 * A member enters results from their own screening or doctor's visit. They're
 * tracked right away; screening points follow once an admin verifies them.
 */
export async function saveSelfReportedScreening(_prev: ScreeningState, formData: FormData): Promise<ScreeningState> {
  const user = await requireUser();
  const day = String(formData.get("screenedOn") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { error: "Choose the date of your screening.", ok: null };
  const date = dateOnly(day);
  const today = programToday();
  if (date > today) return { error: "The date can't be in the future.", ok: null };
  if (date < addDays(today, -730)) return { error: "Enter screenings from the last two years.", ok: null };

  const results: { marker: string; value: number }[] = [];
  for (const m of MARKERS) {
    const raw = String(formData.get(`m_${m.key}`) ?? "").trim();
    if (!raw) continue;
    const value = Number(raw);
    const problem = checkMarker(m.key, value);
    if (problem) return { error: problem, ok: null };
    results.push({ marker: m.key, value });
  }
  if (!results.length) return { error: "Enter at least one result.", ok: null };

  await saveScreening({ userId: user.id, screenedOn: day, source: "self_reported", results });
  revalidatePath("/", "layout");
  return { error: null, ok: `Saved ${results.length} result${results.length === 1 ? "" : "s"}. Your screening points follow once the wellness team verifies it.` };
}

export async function setBiometricGoal(marker: string, formData: FormData) {
  const user = await requireUser();
  const m = MARKER_BY_KEY.get(marker);
  if (!m) return;
  const target = Number(formData.get("target"));
  const direction = formData.get("direction") === "above" ? "above" : "below";
  if (checkMarker(marker, target)) return;
  await db.biometricGoal.upsert({
    where: { userId_marker: { userId: user.id, marker } },
    create: { userId: user.id, marker, target, direction },
    update: { target, direction },
  });
  revalidatePath("/progress", "layout");
}

export async function clearBiometricGoal(marker: string) {
  const user = await requireUser();
  await db.biometricGoal.deleteMany({ where: { userId: user.id, marker } });
  revalidatePath("/progress", "layout");
}
