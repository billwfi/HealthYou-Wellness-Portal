import type { ChallengeMetric, ChallengeType, TeamMode } from "./domain";

export const METRIC_META: Record<ChallengeMetric, { label: string; unit: string; dailyMax: number; hint: string }> = {
  steps: { label: "Steps", unit: "steps", dailyMax: 100_000, hint: "Steps logged each day" },
  active_minutes: { label: "Active minutes", unit: "min", dailyMax: 1_440, hint: "Minutes of any logged exercise" },
  distance_miles: { label: "Distance", unit: "mi", dailyMax: 200, hint: "Miles walked, run or rolled" },
  workouts: { label: "Workouts", unit: "workouts", dailyMax: 20, hint: "Each logged exercise session counts once" },
  servings: { label: "Servings", unit: "servings", dailyMax: 50, hint: "Fruit, vegetable and water servings" },
  habit_checkins: { label: "Habit check-ins", unit: "check-ins", dailyMax: 20, hint: "Daily habits checked off" },
};

export const CHALLENGE_TYPE_META: Record<
  ChallengeType,
  { label: string; summary: string; goal: "required" | "none"; goalLabel?: string; usesDailyGoal: boolean; scoreLabel: string }
> = {
  leaderboard: { label: "Leaderboard", summary: "Most total wins. Everyone who takes part earns points.", goal: "none", usesDailyGoal: false, scoreLabel: "Total" },
  target: { label: "Target", summary: "Reach the goal before the end date.", goal: "required", goalLabel: "Goal (total)", usesDailyGoal: false, scoreLabel: "Total" },
  race: { label: "Race", summary: "A virtual course: reach the finish line before time runs out.", goal: "required", goalLabel: "Finish line (total)", usesDailyGoal: false, scoreLabel: "Distance covered" },
  streak: { label: "Streak", summary: "Hit the daily goal on consecutive days.", goal: "required", goalLabel: "Streak length (days)", usesDailyGoal: true, scoreLabel: "Days met" },
  stick_to_it: { label: "Stick to it", summary: "Hit the daily goal on enough days. They don't have to be in a row.", goal: "required", goalLabel: "Days needed", usesDailyGoal: true, scoreLabel: "Days met" },
  group_goal: { label: "Group goal", summary: "Everyone's progress adds up toward one shared goal.", goal: "required", goalLabel: "Shared goal (total)", usesDailyGoal: false, scoreLabel: "Contribution" },
};

export const TEAM_MODE_META: Record<TeamMode, { label: string; summary: string }> = {
  individual: { label: "Individual", summary: "Everyone takes part on their own." },
  team: { label: "Teams", summary: "Join or start a team. Teams rank by average per member." },
  hybrid: { label: "Solo or team", summary: "Take part alone or with a team." },
};

/** Score is days-based for streak types, otherwise the summed value. */
export function isDayScored(type: string) {
  return type === "streak" || type === "stick_to_it";
}

export type ChallengePhase = "draft" | "archived" | "upcoming" | "active" | "ended" | "finalized";

/**
 * Where a challenge is in its life. Stored status covers admin decisions
 * (draft, archived, completed = finalized); the dates decide the rest.
 */
export function challengePhase(c: { status: string; startDate: Date; endDate: Date }, today: Date): ChallengePhase {
  if (c.status === "draft") return "draft";
  if (c.status === "archived") return "archived";
  if (c.status === "completed") return "finalized";
  if (today < c.startDate) return "upcoming";
  if (today > c.endDate) return "ended";
  return "active";
}

export function isJoinable(phase: ChallengePhase) {
  return phase === "upcoming" || phase === "active";
}

export function formatAmount(value: number, metric: string) {
  const unit = METRIC_META[metric as ChallengeMetric]?.unit ?? "";
  const n = metric === "distance_miles" ? Math.round(value * 10) / 10 : Math.round(value);
  return `${n.toLocaleString()} ${unit}`.trim();
}

/** Public name on leaderboards: first name and last initial. */
export function displayName(u: { name: string; firstName?: string | null; lastName?: string | null }) {
  const first = u.firstName?.trim() || u.name.trim().split(/\s+/)[0] || "Member";
  const last = u.lastName?.trim() || u.name.trim().split(/\s+/).slice(1).join(" ");
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

/** Whole days from a to b (both @db.Date values), inclusive. */
export function daysBetweenInclusive(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
}

/** How far back members can log activity themselves. */
export const ACTIVITY_BACKFILL_DAYS = 7;

const GOAL_TYPES = new Set(["target", "race", "streak", "stick_to_it"]);

/** Challenge types with a personal goal that completes the challenge. */
export function hasPersonalGoal(type: string) {
  return GOAL_TYPES.has(type);
}

type Scorable = { type: string; startDate: Date; endDate: Date; goalValue: number | null; dailyGoal: number | null };

/**
 * One member's standing from their per-day values (pure, so it's unit-testable).
 * Days are @db.Date values; `today` is the program's current day.
 */
export function summarizeProgress(c: Scorable, rows: { day: Date; value: number }[], today: Date) {
  const DAY = 86_400_000;
  const dailyGoal = c.dailyGoal ?? 1;
  const met = new Set<number>();
  let total = 0;
  for (const r of rows) {
    total += r.value;
    if (r.value >= dailyGoal) met.add(r.day.getTime());
  }

  let best = 0;
  let run = 0;
  for (let t = c.startDate.getTime(); t <= c.endDate.getTime(); t += DAY) {
    run = met.has(t) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  // Current streak ends today, or yesterday if today isn't logged yet.
  const last = Math.min(today.getTime(), c.endDate.getTime());
  let current = 0;
  for (let t = met.has(last) ? last : last - DAY; t >= c.startDate.getTime() && met.has(t); t -= DAY) current++;

  const goal = c.goalValue;
  const score = c.type === "streak" ? best : isDayScored(c.type) ? met.size : total;
  const personal = hasPersonalGoal(c.type);
  return {
    total,
    daysMet: met.size,
    currentStreak: current,
    bestStreak: best,
    score,
    goal,
    complete: goal != null && personal && score >= goal,
    pct: goal && personal ? Math.min(1, score / goal) : null,
  };
}

// ── Eligibility ──────────────────────────────────────────────────────────────
// Stored as JSON in challenges.eligibility. Empty or missing lists mean "anyone".

export type Eligibility = { memberTypes?: string[]; departments?: string[] };

export function parseEligibility(json: string | null | undefined): Eligibility {
  if (!json) return {};
  try {
    const v = JSON.parse(json) as Eligibility;
    return {
      memberTypes: Array.isArray(v.memberTypes) ? v.memberTypes.filter((s) => typeof s === "string") : undefined,
      departments: Array.isArray(v.departments) ? v.departments.filter((s) => typeof s === "string") : undefined,
    };
  } catch {
    return {};
  }
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function isEligible(e: Eligibility, member: { memberType?: string | null; department?: string | null }) {
  if (e.memberTypes?.length && !e.memberTypes.includes(member.memberType ?? "")) return false;
  if (e.departments?.length) {
    const dept = norm(member.department ?? "");
    if (!dept || !e.departments.some((d) => norm(d) === dept)) return false;
  }
  return true;
}

const MEMBER_TYPE_PLURAL: Record<string, string> = { employee: "City employees", spouse: "spouses and partners", retiree: "retirees" };

/** "Open to City employees and retirees in Parks or Fire", or null when open to everyone. */
export function describeEligibility(e: Eligibility) {
  const parts: string[] = [];
  if (e.memberTypes?.length) parts.push(e.memberTypes.map((t) => MEMBER_TYPE_PLURAL[t] ?? t).join(" and "));
  if (e.departments?.length) parts.push(`${parts.length ? "in" : "members of"} ${e.departments.join(" or ")}`);
  return parts.length ? `Open to ${parts.join(" ")}` : null;
}

// ── Milestones ───────────────────────────────────────────────────────────────

/** Ledger key for a milestone: stable across edits, so re-saving never pays twice. */
export function milestoneSourceId(challengeId: number, threshold: number) {
  return `${challengeId}:${threshold}`;
}
