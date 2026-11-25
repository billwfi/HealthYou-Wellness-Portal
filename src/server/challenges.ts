import "server-only";
import { db } from "@/db";
import type { ChallengeMetric } from "@/lib/domain";
import { addDays, programToday } from "@/lib/dates";
import { displayName, hasPersonalGoal, isDayScored, summarizeProgress } from "@/lib/challenges";
import { awardPoints } from "./points";

// How it works: activity entries and habit check-ins are the source of truth.
// Whenever they change, recomputeProgress() rewrites the member's per-day rows in
// challenge_progress_daily (capped per day) for every challenge they're in.
// Leaderboards and summaries read those rows.

type Challenge = {
  id: number;
  type: string;
  metric: string;
  goalValue: { toString(): string } | null;
  dailyGoal: { toString(): string } | null;
  dailyCap: { toString(): string } | null;
  startDate: Date;
  endDate: Date;
  pointsOnCompletion: number;
  name: string;
};

const num = (d: { toString(): string } | null | undefined) => (d == null ? null : Number(d.toString()));

/** Per-day totals for every challenge metric, for one member. */
async function dailyMetricValues(userId: string, from: Date, to: Date) {
  const [entries, habitLogs] = await Promise.all([
    db.activityEntry.findMany({
      where: { userId, entryDate: { gte: from, lte: to } },
      select: { entryDate: true, value: true, activityType: { select: { metric: true, category: true } } },
    }),
    db.habitLog.groupBy({ by: ["logDate"], where: { userId, logDate: { gte: from, lte: to } }, _count: { _all: true } }),
  ]);

  const days = new Map<number, Record<ChallengeMetric, number>>();
  const day = (d: Date) => {
    let v = days.get(d.getTime());
    if (!v) {
      v = { steps: 0, active_minutes: 0, distance_miles: 0, workouts: 0, servings: 0, habit_checkins: 0 };
      days.set(d.getTime(), v);
    }
    return v;
  };
  for (const e of entries) {
    const v = day(e.entryDate);
    const amount = Number(e.value.toString());
    const metric = e.activityType.metric;
    if (metric === "steps" || metric === "active_minutes" || metric === "distance_miles" || metric === "servings") v[metric] += amount;
    // A workout is any logged exercise session other than a step count.
    if (e.activityType.category === "physical_activity" && metric !== "steps") v.workouts += 1;
  }
  for (const h of habitLogs) day(h.logDate).habit_checkins += h._count._all;
  return days;
}

/** Rewrite a member's challenge progress for days in [from, to], then settle completions. */
export async function recomputeProgress(userId: string, from: Date, to: Date) {
  const enrollments = await db.challengeEnrollment.findMany({
    where: {
      userId,
      challenge: { startDate: { lte: to }, endDate: { gte: from }, status: { notIn: ["draft", "archived", "completed"] } },
    },
    include: { challenge: true },
  });
  if (!enrollments.length) return;

  const values = await dailyMetricValues(userId, from, to);
  for (const { challenge: c } of enrollments) {
    const start = c.startDate > from ? c.startDate : from;
    const end = c.endDate < to ? c.endDate : to;
    const cap = num(c.dailyCap);
    const rows: { challengeId: number; userId: string; day: Date; value: number }[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const raw = values.get(d.getTime())?.[c.metric as ChallengeMetric] ?? 0;
      const value = cap != null ? Math.min(raw, cap) : raw;
      if (value > 0) rows.push({ challengeId: c.id, userId, day: d, value });
    }
    await db.$transaction([
      db.challengeProgressDaily.deleteMany({ where: { challengeId: c.id, userId, day: { gte: start, lte: end } } }),
      ...(rows.length ? [db.challengeProgressDaily.createMany({ data: rows })] : []),
    ]);
  }
  await settleCompletions(userId, enrollments.filter((e) => !e.completedAt).map((e) => e.challenge));
}

/** Goal-based challenges complete the moment the goal is met; award their points once. */
async function settleCompletions(userId: string, challenges: Challenge[]) {
  for (const c of challenges) {
    if (!hasPersonalGoal(c.type)) continue;
    const summary = await getMemberSummary(userId, c);
    if (summary.complete) await markComplete(userId, c);
  }
}

async function markComplete(userId: string, c: Challenge) {
  const { count } = await db.challengeEnrollment.updateMany({
    where: { challengeId: c.id, userId, completedAt: null },
    data: { completedAt: new Date() },
  });
  if (count && c.pointsOnCompletion > 0) {
    await awardPoints({
      userId,
      ruleSlug: "challenge",
      sourceType: "challenge",
      sourceId: String(c.id),
      description: `Finished: ${c.name}`.slice(0, 500),
      on: programToday(),
      points: c.pointsOnCompletion,
    });
  }
}

export type MemberSummary = Awaited<ReturnType<typeof getMemberSummary>>;

/** One member's standing: total, days met, streaks, score and goal progress. */
export async function getMemberSummary(userId: string, c: Challenge) {
  const rows = await db.challengeProgressDaily.findMany({
    where: { challengeId: c.id, userId },
    select: { day: true, value: true },
  });
  return summarizeProgress(
    { type: c.type, startDate: c.startDate, endDate: c.endDate, goalValue: num(c.goalValue), dailyGoal: num(c.dailyGoal) },
    rows.map((r) => ({ day: r.day, value: Number(r.value.toString()) })),
    programToday(),
  );
}

type Ranked = { userId: string; name: string; score: number; rank: number; teamName: string | null };

/** Individual and team standings. Teams rank by average score per member. */
export async function getLeaderboard(c: Challenge & { dailyGoal: { toString(): string } | null }, userId: string, limit = 10) {
  const dayScored = isDayScored(c.type);
  const dailyGoal = num(c.dailyGoal) ?? 1;

  const [scores, enrollments] = await Promise.all([
    dayScored
      ? db.challengeProgressDaily
          .groupBy({ by: ["userId"], where: { challengeId: c.id, value: { gte: dailyGoal } }, _count: { _all: true } })
          .then((g) => g.map((r) => ({ userId: r.userId, score: r._count._all })))
      : db.challengeProgressDaily
          .groupBy({ by: ["userId"], where: { challengeId: c.id }, _sum: { value: true } })
          .then((g) => g.map((r) => ({ userId: r.userId, score: Number(r._sum.value?.toString() ?? 0) }))),
    db.challengeEnrollment.findMany({
      where: { challengeId: c.id },
      select: { userId: true, team: { select: { id: true, name: true } }, user: { select: { name: true, firstName: true, lastName: true } } },
    }),
  ]);

  const scoreOf = new Map(scores.map((s) => [s.userId, s.score]));
  const all: Ranked[] = enrollments
    .map((e) => ({ userId: e.userId, name: displayName(e.user), score: scoreOf.get(e.userId) ?? 0, rank: 0, teamName: e.team?.name ?? null }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  // Standard competition ranking: ties share a rank.
  all.forEach((r, i) => (r.rank = i > 0 && r.score === all[i - 1].score ? all[i - 1].rank : i + 1));

  const teams = new Map<number, { id: number; name: string; members: number; total: number }>();
  for (const e of enrollments) {
    if (!e.team) continue;
    const t = teams.get(e.team.id) ?? { id: e.team.id, name: e.team.name, members: 0, total: 0 };
    t.members += 1;
    t.total += scoreOf.get(e.userId) ?? 0;
    teams.set(e.team.id, t);
  }
  const teamBoard = [...teams.values()]
    .map((t) => ({ ...t, average: t.members ? t.total / t.members : 0, rank: 0 }))
    .sort((a, b) => b.average - a.average || a.name.localeCompare(b.name));
  teamBoard.forEach((t, i) => (t.rank = i > 0 && t.average === teamBoard[i - 1].average ? teamBoard[i - 1].rank : i + 1));

  return {
    top: all.slice(0, limit),
    me: all.find((r) => r.userId === userId) ?? null,
    participants: all.length,
    groupTotal: all.reduce((s, r) => s + r.score, 0),
    teams: teamBoard,
  };
}

/** Admin: close an ended challenge. Leaderboard and group challenges reward everyone who took part. */
export async function finalizeChallenge(challengeId: number) {
  const c = await db.challenge.findUniqueOrThrow({ where: { id: challengeId } });
  if (!hasPersonalGoal(c.type)) {
    const participants = await db.challengeProgressDaily.groupBy({ by: ["userId"], where: { challengeId } });
    for (const p of participants) await markComplete(p.userId, c);
  }
  await db.challenge.update({ where: { id: challengeId }, data: { status: "completed" } });
}
