import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Flame, Medal, Plus, Trophy, UserPlus, Users } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { CHALLENGE_TYPE_META, challengePhase, formatAmount, isJoinable, METRIC_META, TEAM_MODE_META } from "@/lib/challenges";
import type { ChallengeMetric, ChallengeType, TeamMode } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { getLeaderboard, getMemberSummary } from "@/server/challenges";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FormError } from "@/components/auth/field";
import { ActionButton } from "@/components/content/action-button";
import { phaseLabel, scoreText } from "@/components/challenges/challenge-card";
import { joinChallenge, leaveChallenge } from "../actions";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ error?: string }>;

const JOIN_ERRORS: Record<string, string> = {
  closed: "This challenge isn't open for joining.",
  "team-required": "This is a team challenge: start or join a team.",
  "solo-only": "This challenge is individual only.",
  "team-name": "Team names need 2 to 60 characters.",
  "team-taken": "Another team already has that name.",
  "team-full": "That team is full. Pick another or start your own.",
  "team-missing": "That team no longer exists.",
};

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(d);

async function getChallenge(slug: string) {
  return db.challenge.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = await getChallenge((await params).slug);
  return { title: c?.name ?? "Challenge" };
}

export default async function ChallengePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const user = await requireUser();
  const [c, sp] = [await getChallenge((await params).slug), await searchParams];
  if (!c || ((c.status === "draft" || c.status === "archived") && user.role !== "admin")) notFound();

  const today = programToday();
  const phase = challengePhase(c, today);
  const typeMeta = CHALLENGE_TYPE_META[c.type as ChallengeType];
  const metric = METRIC_META[c.metric as ChallengeMetric];
  const teamMode = (c.teamMode as TeamMode) ?? "individual";

  const [enrollment, board, teams] = await Promise.all([
    db.challengeEnrollment.findUnique({
      where: { challengeId_userId: { challengeId: c.id, userId: user.id } },
      include: { team: { select: { id: true, name: true, captainId: true } } },
    }),
    getLeaderboard(c, user.id),
    teamMode === "individual"
      ? Promise.resolve([])
      : db.team.findMany({
          where: { challengeId: c.id },
          include: { _count: { select: { enrollments: true } } },
          orderBy: { name: "asc" },
        }),
  ]);
  const summary = enrollment ? await getMemberSummary(user.id, c) : null;
  const joinable = isJoinable(phase);
  const goal = c.goalValue ? Number(c.goalValue.toString()) : null;
  const dailyGoal = c.dailyGoal ? Number(c.dailyGoal.toString()) : null;
  const dailyCap = c.dailyCap ? Number(c.dailyCap.toString()) : null;
  const score = (n: number) => scoreText(n, c.type, c.metric);
  const openTeams = teams.filter((t) => !c.maxTeamSize || t._count.enrollments < c.maxTeamSize);

  const rules = [
    typeMeta?.summary,
    metric && `Counts ${metric.hint.toLowerCase()}.`,
    dailyGoal != null && typeMeta?.usesDailyGoal && `A day counts when you reach ${formatAmount(dailyGoal, c.metric)}.`,
    dailyCap != null && `Up to ${formatAmount(dailyCap, c.metric)} a day counts.`,
    TEAM_MODE_META[teamMode]?.summary,
    c.maxTeamSize && `Teams of up to ${c.maxTeamSize}.`,
    c.pointsOnCompletion > 0 &&
      (c.type === "leaderboard" || c.type === "group_goal"
        ? `Everyone who logs progress earns ${c.pointsOnCompletion} points when it ends.`
        : `Finish to earn ${c.pointsOnCompletion} points.`),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <Link href="/challenges" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Challenges
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{typeMeta?.label ?? c.type}</Badge>
          <Badge>{phaseLabel(phase, c.startDate, c.endDate, today)}</Badge>
          {phase === "draft" && <Badge tone="warning">Only admins can see this</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{c.name}</h1>
        <p className="mt-1 text-ink-muted">
          {fmtDay(c.startDate)} – {fmtDay(c.endDate)} · {board.participants} {board.participants === 1 ? "participant" : "participants"}
        </p>
        {c.description && <p className="mt-3 max-w-3xl text-ink">{c.description}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Your progress */}
          {enrollment && summary && (
            <Card>
              <CardHeader
                title="Your progress"
                description={enrollment.team ? `Team ${enrollment.team.name}` : "Going solo"}
                action={
                  enrollment.completedAt ? (
                    <Badge tone="success">
                      <CheckCircle2 className="size-3" aria-hidden /> Completed
                    </Badge>
                  ) : undefined
                }
              />
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-3xl font-extrabold tabular-nums text-ink">{score(summary.score)}</span>
                  {summary.pct != null && goal != null && <span className="text-ink-muted">of {score(goal)}</span>}
                </div>
                {summary.pct != null && (
                  <ProgressBar value={summary.pct} label="Your progress toward the goal" tone={enrollment.completedAt ? "success" : "primary"} />
                )}
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {[
                    { k: "Total", v: formatAmount(summary.total, c.metric) },
                    { k: "Days active", v: String(summary.daysMet) },
                    { k: "Current streak", v: `${summary.currentStreak} days` },
                    { k: "Best streak", v: `${summary.bestStreak} days` },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl bg-surface-muted p-3">
                      <dt className="text-xs text-ink-muted">{s.k}</dt>
                      <dd className="mt-0.5 font-bold tabular-nums text-ink">{s.v}</dd>
                    </div>
                  ))}
                </dl>
                {board.me && board.participants > 1 && (
                  <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <Medal className="size-4 text-warning" aria-hidden /> You&apos;re #{board.me.rank} of {board.participants}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {phase === "active" && (
                    <ButtonLink href="/progress#log">
                      <Plus className="size-4" aria-hidden /> Log activity
                    </ButtonLink>
                  )}
                  {joinable && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-ink-muted hover:text-ink">Leave challenge</summary>
                      <form action={leaveChallenge.bind(null, c.id)} className="mt-2">
                        <p className="text-xs text-ink-muted">Your challenge progress is removed. Points you&apos;ve earned stay.</p>
                        <ActionButton className="mt-2 rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft" pendingLabel="Leaving…">
                          Yes, leave
                        </ActionButton>
                      </form>
                    </details>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Join */}
          {!enrollment && joinable && (
            <Card id="join" className="scroll-mt-24">
              <CardHeader title="Join this challenge" description={TEAM_MODE_META[teamMode]?.summary} />
              <CardBody className="space-y-5">
                <FormError message={sp.error ? (JOIN_ERRORS[sp.error] ?? "Something went wrong. Try again.") : null} />
                {teamMode !== "team" && (
                  <form action={joinChallenge.bind(null, c.id)}>
                    <input type="hidden" name="mode" value="solo" />
                    <ActionButton className={buttonClasses()} pendingLabel="Joining…">
                      <UserPlus className="size-4" aria-hidden /> {teamMode === "hybrid" ? "Join solo" : "Join challenge"}
                    </ActionButton>
                  </form>
                )}
                {teamMode !== "individual" && (
                  <>
                    <form action={joinChallenge.bind(null, c.id)} className="flex flex-wrap items-end gap-2">
                      <input type="hidden" name="mode" value="create" />
                      <div className="min-w-48 flex-1">
                        <label htmlFor="teamName" className="block text-sm font-semibold text-ink">
                          Start a team
                        </label>
                        <input
                          id="teamName"
                          name="teamName"
                          required
                          minLength={2}
                          maxLength={60}
                          placeholder="Team name"
                          className="mt-1.5 block h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                        />
                      </div>
                      <ActionButton className={buttonClasses({ variant: "secondary" })} pendingLabel="Creating…">
                        <Plus className="size-4" aria-hidden /> Create &amp; join
                      </ActionButton>
                    </form>
                    {openTeams.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Or join a team</h3>
                        <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                          {openTeams.map((t) => (
                            <li key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                              <span className="min-w-0">
                                <span className="block truncate font-semibold text-ink">{t.name}</span>
                                <span className="text-xs text-ink-muted">
                                  {t._count.enrollments} member{t._count.enrollments === 1 ? "" : "s"}
                                  {c.maxTeamSize ? ` of ${c.maxTeamSize}` : ""}
                                  {t.department ? ` · ${t.department}` : ""}
                                </span>
                              </span>
                              <form action={joinChallenge.bind(null, c.id)}>
                                <input type="hidden" name="mode" value="join" />
                                <input type="hidden" name="teamId" value={t.id} />
                                <ActionButton className={buttonClasses({ variant: "secondary", size: "sm" })} pendingLabel="Joining…" aria-label={`Join team ${t.name}`}>
                                  Join
                                </ActionButton>
                              </form>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Group goal */}
          {c.type === "group_goal" && goal != null && (
            <Card>
              <CardHeader title="Everyone together" description={`${formatAmount(board.groupTotal, c.metric)} of ${formatAmount(goal, c.metric)}`} />
              <CardBody>
                <ProgressBar value={board.groupTotal / goal} label="Group progress toward the shared goal" tone={board.groupTotal >= goal ? "success" : "primary"} />
              </CardBody>
            </Card>
          )}

          {/* Leaderboards */}
          {board.teams.length > 0 && (
            <Card>
              <CardHeader title="Team standings" description="Ranked by average per member, so every team size has a fair shot." />
              <ol className="divide-y divide-border">
                {board.teams.slice(0, 20).map((t) => (
                  <li key={t.id} className={cn("flex items-center gap-3 px-5 py-3 text-sm", enrollment?.team?.id === t.id && "bg-primary-soft")}>
                    <span className="w-6 text-right font-bold tabular-nums text-ink-muted">{t.rank}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{t.name}</span>
                      <span className="text-xs text-ink-muted">
                        {t.members} member{t.members === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-bold tabular-nums text-ink">{score(Math.round(t.average * 10) / 10)}</span>
                      <span className="text-xs text-ink-muted">avg per member</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card>
            <CardHeader title="Leaderboard" description={typeMeta ? `${typeMeta.scoreLabel}` : undefined} />
            {board.top.length ? (
              <ol className="divide-y divide-border">
                {board.top.map((r) => (
                  <LeaderRow key={r.userId} rank={r.rank} name={r.name} team={r.teamName} value={score(r.score)} me={r.userId === user.id} />
                ))}
                {board.me && !board.top.some((r) => r.userId === user.id) && (
                  <>
                    <li aria-hidden className="px-5 py-1 text-center text-ink-subtle">⋯</li>
                    <LeaderRow rank={board.me.rank} name={board.me.name} team={board.me.teamName} value={score(board.me.score)} me />
                  </>
                )}
              </ol>
            ) : (
              <CardBody className="flex items-center gap-3 text-sm text-ink-muted">
                <Trophy className="size-5 text-ink-subtle" aria-hidden /> No one has joined yet. Be the first.
              </CardBody>
            )}
          </Card>
        </div>

        {/* Rules */}
        <aside>
          <Card>
            <CardHeader title="How it works" />
            <CardBody>
              <ul className="space-y-2.5 text-sm text-ink">
                {rules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
                <li className="flex gap-2">
                  {teamMode === "individual" ? (
                    <Flame className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  )}
                  <span>Log on the Progress page. Entries up to 7 days back count.</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function LeaderRow({ rank, name, team, value, me }: { rank: number; name: string; team: string | null; value: string; me: boolean }) {
  return (
    <li className={cn("flex items-center gap-3 px-5 py-3 text-sm", me && "bg-primary-soft")}>
      <span className="w-6 text-right font-bold tabular-nums text-ink-muted">{rank}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">
          {name}
          {me && <span className="font-normal text-ink-muted"> (you)</span>}
        </span>
        {team && <span className="text-xs text-ink-muted">{team}</span>}
      </span>
      <span className="font-bold tabular-nums text-ink">{value}</span>
    </li>
  );
}
