import "server-only";
import { db } from "@/db";
import { dateOnly } from "@/lib/dates";
import { MARKER_BY_KEY, SOURCE_LABELS, type ScreeningSource } from "@/lib/biometrics";
import { awardPoints } from "./points";

type Input = {
  userId: string;
  screenedOn: string; // YYYY-MM-DD
  source: ScreeningSource;
  results: { marker: string; value: number }[];
  /** Admin name or "import"; set for anything that isn't self-reported. */
  verifiedBy?: string | null;
};

/**
 * Save a screening. The same member, date and source replaces the earlier
 * results (so re-importing a corrected file is safe). Verified screenings earn
 * the yearly screening points.
 */
export async function saveScreening({ userId, screenedOn, source, results, verifiedBy = null }: Input) {
  const day = dateOnly(screenedOn);
  const verified = verifiedBy != null;
  const screening = await db.$transaction(async (tx) => {
    const existing = await tx.biometricScreening.findFirst({ where: { userId, screenedOn: day, source } });
    const row = existing
      ? await tx.biometricScreening.update({
          where: { id: existing.id },
          data: verified ? { verifiedBy, verifiedAt: new Date() } : {},
        })
      : await tx.biometricScreening.create({
          data: { userId, screenedOn: day, source, verifiedBy, verifiedAt: verified ? new Date() : null },
        });
    await tx.biometricResult.deleteMany({ where: { screeningId: row.id } });
    await tx.biometricResult.createMany({ data: results.map((r) => ({ screeningId: row.id, marker: r.marker, value: r.value, unit: MARKER_BY_KEY.get(r.marker)?.unit ?? "" })) });
    return { row, created: !existing };
  });
  const points = verified ? await awardScreeningPoints(userId, screening.row.id, day, source) : 0;
  return { id: screening.row.id, created: screening.created, points };
}

/** Points for a verified screening: the "screening" rule caps it at once a year. */
export async function awardScreeningPoints(userId: string, screeningId: number, day: Date, source: string) {
  return awardPoints({
    userId,
    ruleSlug: "screening",
    sourceType: "screening",
    sourceId: String(screeningId),
    description: `Biometric screening (${SOURCE_LABELS[source as ScreeningSource] ?? source})`,
    on: day,
  });
}

/** All of a member's screenings (oldest first) and their personal targets. */
export async function getBiometricHistory(userId: string) {
  const [screenings, goals] = await Promise.all([
    db.biometricScreening.findMany({ where: { userId }, include: { results: true }, orderBy: { screenedOn: "asc" } }),
    db.biometricGoal.findMany({ where: { userId } }),
  ]);
  const series = new Map<string, { date: Date; value: number; verified: boolean }[]>();
  for (const s of screenings) {
    for (const r of s.results) {
      const list = series.get(r.marker) ?? [];
      list.push({ date: s.screenedOn, value: Number(r.value.toString()), verified: s.verifiedAt != null });
      series.set(r.marker, list);
    }
  }
  return {
    screenings,
    series,
    goals: new Map(goals.map((g) => [g.marker, { target: Number(g.target.toString()), direction: g.direction }])),
  };
}
