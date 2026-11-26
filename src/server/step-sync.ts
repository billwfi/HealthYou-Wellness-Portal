import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/db";
import { addDays, dateOnly, programToday } from "@/lib/dates";
import { SYNC_BACKFILL_DAYS, SYNC_STEPS_MAX } from "@/lib/challenges";
import { awardPoints } from "@/server/points";
import { recomputeProgress } from "@/server/challenges";

/** The only device sync so far: an Apple Shortcut that posts the day's step total. */
export const SHORTCUT_PROVIDER = "apple_health";

/** Repeated syncs closer together than this are turned away. */
const MIN_INTERVAL_MS = 30_000;

export const hashSyncKey = (key: string) => createHash("sha256").update(key).digest("hex");

/** A new personal sync key. Only its hash is stored, so it can be shown once. */
export function newSyncKey() {
  return `ryp_${randomBytes(24).toString("base64url")}`;
}

export type SyncResult = { status: number; body: { ok: boolean; message: string; steps?: number; date?: string } };

const fail = (status: number, message: string): SyncResult => ({ status, body: { ok: false, message } });

/** Steps from a Shortcut can arrive as a number or text ("8432", "8,432", "8432.0"). */
export function parseSteps(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(/[,\s]/g, "")) : NaN;
  return Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * Record one day's synced step total for the member who owns `key`.
 * The synced total is the day's figure: it replaces any steps typed in for that
 * day (and their points), and a later sync for the same day replaces an earlier one.
 */
export async function syncSteps(key: string, input: { steps: unknown; date?: unknown }): Promise<SyncResult> {
  if (!key.startsWith("ryp_") || key.length > 100) return fail(401, "That sync key isn't recognized. Get a new one under Profile → Step sync.");
  const connection = await db.deviceConnection.findFirst({
    where: { tokenHash: hashSyncKey(key), provider: SHORTCUT_PROVIDER, status: "connected" },
  });
  if (!connection) return fail(401, "That sync key isn't recognized. Get a new one under Profile → Step sync.");

  const steps = parseSteps(input.steps);
  if (steps == null || steps < 0) return fail(400, "No step count was sent. Check the shortcut's steps field.");
  if (steps > SYNC_STEPS_MAX) return fail(400, `More than ${SYNC_STEPS_MAX.toLocaleString()} steps in a day can't be synced.`);

  const today = programToday();
  let day = today;
  if (input.date != null && input.date !== "") {
    const s = String(input.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return fail(400, "The date should look like 2026-11-26.");
    day = dateOnly(s);
    if (day > today) return fail(400, "That date is in the future.");
    if (day < addDays(today, -SYNC_BACKFILL_DAYS)) return fail(400, `Only the last ${SYNC_BACKFILL_DAYS} days can be synced.`);
  }
  const iso = day.toISOString().slice(0, 10);

  // Claim the sync slot first so two runs at once can't both write.
  const claimed = await db.deviceConnection.updateMany({
    where: { id: connection.id, OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: new Date(Date.now() - MIN_INTERVAL_MS) } }] },
    data: { lastSyncedAt: new Date() },
  });
  if (!claimed.count) return fail(429, "Synced a moment ago. Try again in a minute.");

  const type = await db.activityType.findFirst({ where: { metric: "steps", isActive: true }, orderBy: { id: "asc" } });
  if (!type) return fail(503, "Step tracking isn't set up in the program yet.");

  const userId = connection.userId;
  const externalId = `${SHORTCUT_PROVIDER}:${iso}`;
  const replaced = await db.activityEntry.findMany({
    where: {
      userId,
      entryDate: day,
      activityType: { metric: "steps" },
      OR: [{ source: "manual" }, { source: "device", externalId }],
    },
    select: { id: true },
  });
  const replacedIds = replaced.map((e) => String(e.id));

  const entry = await db.$transaction(async (tx) => {
    if (replacedIds.length) {
      await tx.pointsLedger.deleteMany({ where: { userId, sourceType: "activity", sourceId: { in: replacedIds } } });
      await tx.activityEntry.deleteMany({ where: { id: { in: replaced.map((e) => e.id) } } });
    }
    if (steps === 0) return null;
    return tx.activityEntry.create({
      data: { userId, activityTypeId: type.id, entryDate: day, value: steps, source: "device", externalId, notes: "Synced from Apple Health" },
    });
  });

  if (entry) {
    const points = Math.floor(steps * Number(type.pointsPerUnit.toString()));
    if (points > 0) {
      await awardPoints({
        userId,
        ruleSlug: "physical-activity",
        sourceType: "activity",
        sourceId: String(entry.id),
        description: `${type.name}: ${steps.toLocaleString()} ${type.unit} (synced)`,
        on: day,
        points,
      });
    }
  }
  await recomputeProgress(userId, day, day);
  await db.deviceConnection.update({ where: { id: connection.id }, data: { lastValue: steps, lastDay: day, lastError: null } });

  const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(day);
  return { status: 200, body: { ok: true, message: `Synced ${steps.toLocaleString()} steps for ${label}.`, steps, date: iso } };
}
