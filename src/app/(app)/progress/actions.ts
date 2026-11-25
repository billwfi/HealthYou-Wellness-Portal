"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { addDays, dateOnly, programToday } from "@/lib/dates";
import { ACTIVITY_BACKFILL_DAYS as BACKFILL_DAYS, METRIC_META } from "@/lib/challenges";
import type { ChallengeMetric } from "@/lib/domain";
import { awardPoints } from "@/server/points";
import { recomputeProgress } from "@/server/challenges";

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
  const max = METRIC_META[type.metric as ChallengeMetric]?.dailyMax ?? 10_000;
  if (value > max) return { error: `That's more than ${max.toLocaleString()} ${type.unit} in a day. Check the amount.`, ok: null };
  const amount = type.metric === "distance_miles" ? Math.round(value * 100) / 100 : Math.round(value);

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
