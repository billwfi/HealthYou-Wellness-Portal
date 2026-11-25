import "server-only";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { addDays, dateOnly, programToday } from "@/lib/dates";
import { hasPersonalGoal } from "@/lib/challenges";
import { inReferenceRange, MARKERS } from "@/lib/biometrics";
import { groupReport, markerOutcome, pct, safeCount, MIN_GROUP, type GroupMember } from "@/lib/reports";

/**
 * Days a member did something in the program: logged activity, checked a habit,
 * opened or finished content, or earned points (admin adjustments excluded).
 */
function participation(from: Date, to: Date) {
  return Prisma.sql`
    SELECT user_id, entry_date AS d FROM activity_entries WHERE entry_date BETWEEN ${from} AND ${to}
    UNION ALL SELECT user_id, log_date FROM habit_logs WHERE log_date BETWEEN ${from} AND ${to}
    UNION ALL SELECT user_id, occurred_on FROM points_ledger WHERE category <> 'adjustment' AND occurred_on BETWEEN ${from} AND ${to}
    UNION ALL SELECT user_id, CAST(viewed_at AS date) FROM content_interactions WHERE viewed_at >= ${from} AND viewed_at < ${addDays(to, 1)}
    UNION ALL SELECT user_id, CAST(completed_at AS date) FROM content_interactions WHERE completed_at >= ${from} AND completed_at < ${addDays(to, 1)}`;
}

export type ProgramReport = Awaited<ReturnType<typeof getProgramReport>>;

/** Everything on the admin Reports page for one plan year, already de-identified. */
export async function getProgramReport(year: number) {
  const from = dateOnly(`${year}-01-01`);
  const today = programToday();
  const yearEnd = dateOnly(`${year}-12-31`);
  const to = yearEnd < today ? yearEnd : today;
  const last30 = addDays(today, -29);

  const [members, activeRows, monthlyRows, recentRows, pointsRows, tiers, redemptions, challenges, screenings] = await Promise.all([
    db.user.findMany({
      where: { createdAt: { lt: addDays(yearEnd, 1) } },
      select: { id: true, profile: { select: { department: true, memberType: true, onboardedAt: true } } },
    }),
    db.$queryRaw<{ user_id: string }[]>`SELECT DISTINCT user_id FROM (${participation(from, to)}) x`,
    db.$queryRaw<{ m: number; n: number }[]>`SELECT MONTH(d) AS m, COUNT(DISTINCT user_id) AS n FROM (${participation(from, to)}) x GROUP BY MONTH(d)`,
    db.$queryRaw<{ n: number }[]>`SELECT COUNT(DISTINCT user_id) AS n FROM (${participation(last30, today)}) x`,
    db.pointsLedger.groupBy({ by: ["userId"], where: { planYear: year }, _sum: { points: true } }),
    db.rewardTier.findMany({ where: { planYear: year }, orderBy: { threshold: "asc" } }),
    db.rewardRedemption.groupBy({ by: ["status"], where: { requestedAt: { gte: from, lt: addDays(yearEnd, 1) } }, _count: true }),
    db.challenge.findMany({
      where: { status: { not: "draft" }, startDate: { lte: yearEnd }, endDate: { gte: from } },
      select: { id: true, name: true, type: true, startDate: true, endDate: true, _count: { select: { enrollments: true } } },
      orderBy: { startDate: "asc" },
    }),
    db.biometricScreening.findMany({
      where: { verifiedAt: { not: null }, screenedOn: { gte: dateOnly(`${year - 1}-01-01`), lte: yearEnd } },
      select: { userId: true, screenedOn: true, results: { select: { marker: true, value: true } } },
      orderBy: { screenedOn: "asc" },
    }),
  ]);

  const active = new Set(activeRows.map((r) => r.user_id));
  const points = new Map(pointsRows.map((r) => [r.userId, r._sum.points ?? 0]));
  const onboarded = members.filter((m) => m.profile?.onboardedAt && m.profile.onboardedAt < addDays(yearEnd, 1)).length;
  const asGroup = (key: "department" | "memberType") =>
    members.map<GroupMember>((m) => ({
      group: key === "memberType" ? memberTypeLabel(m.profile?.memberType) : (m.profile?.department ?? ""),
      onboarded: !!m.profile?.onboardedAt,
      active: active.has(m.id),
      points: points.get(m.id) ?? 0,
    }));

  // Completions for goal-type challenges, counted in one query.
  const goalIds = challenges.filter((c) => hasPersonalGoal(c.type)).map((c) => c.id);
  const completions = goalIds.length
    ? await db.challengeEnrollment.groupBy({ by: ["challengeId"], where: { challengeId: { in: goalIds }, completedAt: { not: null } }, _count: true })
    : [];
  const completedBy = new Map(completions.map((c) => [c.challengeId, c._count]));

  // Latest verified value per member, marker and year.
  const latest = new Map<string, Map<string, boolean>>(); // `${year}:${marker}` → userId → in range
  const screenedThisYear = new Set<string>();
  for (const s of screenings) {
    const y = s.screenedOn.getUTCFullYear();
    if (y === year) screenedThisYear.add(s.userId);
    for (const r of s.results) {
      const ok = inReferenceRange(r.marker, Number(r.value));
      if (ok == null) continue;
      const key = `${y}:${r.marker}`;
      if (!latest.has(key)) latest.set(key, new Map());
      latest.get(key)!.set(s.userId, ok); // ordered by date, so the last write is the latest
    }
  }

  const memberCount = members.length;
  const enough = memberCount >= MIN_GROUP;
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const n = Number(monthlyRows.find((r) => Number(r.m) === i + 1)?.n ?? 0);
    return { month: i + 1, members: safeCount(n), future: dateOnly(`${year}-${String(i + 1).padStart(2, "0")}-01`) > today };
  });
  const tierReach = tiers.map((t) => ({ label: t.label, threshold: t.threshold, members: safeCount([...points.values()].filter((p) => p >= t.threshold).length) }));

  return {
    year,
    isCurrentYear: year === today.getUTCFullYear(),
    headline: {
      members: safeCount(memberCount),
      onboardedPct: enough ? pct(onboarded, memberCount) : null,
      activePct: enough ? pct(active.size, memberCount) : null,
      active30Pct: enough ? pct(Number(recentRows[0]?.n ?? 0), memberCount) : null,
      screenedPct: enough ? pct(screenedThisYear.size, memberCount) : null,
    },
    monthly,
    departments: groupReport(asGroup("department"), "Other departments (combined)"),
    memberTypes: groupReport(asGroup("memberType")),
    challenges: challenges.map((c) => {
      const enrolled = c._count.enrollments;
      const goal = hasPersonalGoal(c.type);
      return {
        name: c.name,
        startDate: c.startDate,
        endDate: c.endDate,
        enrolled: safeCount(enrolled),
        participationPct: enough && enrolled >= MIN_GROUP ? pct(enrolled, memberCount) : null,
        completedPct: goal && enrolled >= MIN_GROUP ? pct(completedBy.get(c.id) ?? 0, enrolled) : goal ? null : undefined,
      };
    }),
    health: MARKERS.filter((m) => m.inRange).map((m) =>
      markerOutcome(m.key, latest.get(`${year}:${m.key}`) ?? new Map(), latest.get(`${year - 1}:${m.key}`) ?? new Map()),
    ),
    rewards: {
      tiers: tierReach,
      fulfilled: safeCount(redemptions.find((r) => r.status === "fulfilled")?._count ?? 0),
      pending: safeCount(redemptions.find((r) => r.status === "pending")?._count ?? 0),
    },
  };
}

export function memberTypeLabel(type: string | null | undefined) {
  return type === "spouse" ? "Spouses" : type === "retiree" ? "Retirees" : "Employees";
}

/** Plan years that have any members, newest first (for the year picker). */
export async function reportYears() {
  const first = await db.user.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });
  const now = programToday().getUTCFullYear();
  const start = first ? Math.min(first.createdAt.getUTCFullYear(), now) : now;
  return Array.from({ length: now - start + 1 }, (_, i) => now - i);
}
