import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Flame, Plus, Sparkles, Target, Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { getRecommendations } from "@/server/recommendations";
import { getTodayHabits } from "@/server/habits";
import { getMemberContext } from "@/server/member";
import { getUpcomingEvents } from "@/server/events";
import { getChallengesForMember } from "@/server/challenge-list";
import { isJoinable } from "@/lib/challenges";
import { ProgressBar } from "@/components/ui/progress-bar";
import { phaseLabel, scoreText } from "@/components/challenges/challenge-card";
import { toggleHabitToday } from "./actions";
import { cn, currentPlanYear, PATHS } from "@/lib/utils";
import { PROGRAM_TIME_ZONE, programToday } from "@/lib/dates";
import { WELLNESS_PATHS } from "@/lib/domain";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ContentCard } from "@/components/content/content-card";
import { ActionButton } from "@/components/content/action-button";
import { EventRow } from "@/components/events/event-row";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const [{ total, nextTier }, picks, habits, member, events, challengeItems] = await Promise.all([
    getPointsSummary(user.id, planYear),
    getRecommendations(user.id, { limit: 4 }),
    getTodayHabits(user.id),
    getMemberContext(user.id),
    getUpcomingEvents({ limit: 3 }),
    getChallengesForMember(user.id),
  ]);
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: PROGRAM_TIME_ZONE }).format(now));
  const firstName = user.firstName || user.name.split(" ")[0];
  const habitsDone = habits.filter((h) => h.doneToday).length;
  const today = programToday(now);
  const myChallenges = challengeItems.filter((i) => i.enrollment && isJoinable(i.phase));
  const openChallenges = challengeItems.filter((i) => !i.enrollment && isJoinable(i.phase)).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="text-sm font-semibold text-ink-muted">
          {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: PROGRAM_TIME_ZONE }).format(now)}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {greeting(hour)}, {firstName}
        </h1>
        </div>
        <ButtonLink href="/progress#log">
          <Plus className="size-4" aria-hidden /> Log activity
        </ButtonLink>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Points */}
        <Card>
          <CardHeader title={`${planYear} points`} description="Participation rewards" />
          <CardBody className="flex items-center gap-5">
            <ProgressRing value={total} max={nextTier?.threshold ?? Math.max(total, 1)} label="Points toward next reward">
              <span>
                <span className="block text-2xl font-extrabold">{total.toLocaleString()}</span>
                <span className="block text-xs text-ink-muted">points</span>
              </span>
            </ProgressRing>
            <div className="text-sm">
              {nextTier ? (
                <>
                  <p className="font-bold text-ink">{(nextTier.threshold - total).toLocaleString()} to go</p>
                  <p className="text-ink-muted">
                    until <span className="font-semibold text-ink">{nextTier.label}</span>: {nextTier.reward}
                  </p>
                </>
              ) : (
                <p className="text-ink-muted">You&apos;ve unlocked every reward tier this year.</p>
              )}
              <Link href="/rewards" className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Ways to earn <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Habits */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today’s habits"
            description={habits.length ? `${habitsDone} of ${habits.length} done` : undefined}
            action={
              <Link href="/welcome" className="text-sm font-semibold text-primary hover:underline">
                Edit
              </Link>
            }
          />
          {habits.length ? (
            <ul className="grid gap-2 p-5 sm:grid-cols-2">
              {habits.map((h) => (
                <li key={h.id}>
                  <form action={toggleHabitToday.bind(null, h.id)}>
                    <ActionButton
                      aria-pressed={h.doneToday}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        h.doneToday ? "border-success/40 bg-success-soft" : "border-border hover:bg-surface-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full border-2",
                          h.doneToday ? "border-success bg-success text-white" : "border-border",
                        )}
                        aria-hidden
                      >
                        {h.doneToday && <Check className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm font-semibold", h.doneToday ? "text-ink-muted" : "text-ink")}>{h.title}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                          {h.streak > 0 ? (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-warning">
                              <Flame className="size-3.5" aria-hidden /> {h.streak}-day streak
                            </span>
                          ) : (
                            <span>Start a streak</span>
                          )}
                          <span>· +{h.points} pts</span>
                        </span>
                      </span>
                    </ActionButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Flame}
              title="Build a streak"
              action={<ButtonLink href="/welcome" variant="secondary">Choose habits</ButtonLink>}
            >
              Small daily habits you can check off for points.
            </EmptyState>
          )}
        </Card>

        {/* For you */}
        <section className="lg:col-span-3" aria-labelledby="for-you-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 id="for-you-heading" className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="size-5 text-primary" aria-hidden /> For you
              </h2>
              <p className="text-sm text-ink-muted">Picked from your interests and goals</p>
            </div>
            <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>
          {picks.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {picks.map((p) => (
                <ContentCard key={p.item.id} item={p.item} reason={p.reason} saved={p.saved} dismissible />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={Sparkles}
                title="You've caught up"
                action={<ButtonLink href="/welcome" variant="secondary">Update interests</ButtonLink>}
              >
                You&apos;ve completed or hidden everything we&apos;d suggest right now. Add interests to see more.
              </EmptyState>
            </Card>
          )}
        </section>

        {/* Events */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming events"
            description="All times Mountain"
            action={
              events.length > 0 && (
                <Link href="/events" className="text-sm font-semibold text-primary hover:underline">
                  See all
                </Link>
              )
            }
          />
          {events.length ? (
            <ul className="space-y-5 p-5">
              {events.map((e) => (
                <li key={e.id}>
                  <EventRow event={e} today={today} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} title="Nothing scheduled yet">
              New webinars and workshops will show up here.
            </EmptyState>
          )}
        </Card>

        {/* Challenges */}
        <Card>
          <CardHeader
            title="Your challenges"
            action={
              <Link href="/challenges" className="text-sm font-semibold text-primary hover:underline">
                {myChallenges.length ? "All" : "Browse"}
              </Link>
            }
          />
          {myChallenges.length ? (
            <ul className="space-y-4 p-5">
              {myChallenges.slice(0, 3).map(({ challenge: c, summary, enrollment, phase }) => (
                <li key={c.id}>
                  <Link href={`/challenges/${c.slug}`} className="group block">
                    <span className="block truncate text-sm font-semibold text-ink group-hover:text-primary">{c.name}</span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-ink-muted">
                      <span>{summary ? scoreText(summary.score, c.type, c.metric) : ""}{summary?.goal != null && summary.pct != null ? ` of ${scoreText(summary.goal, c.type, c.metric)}` : ""}</span>
                      <span>{enrollment?.completedAt ? "Completed" : phaseLabel(phase, c.startDate, c.endDate, today)}</span>
                    </span>
                    {summary?.pct != null && (
                      <ProgressBar value={summary.pct} label={`Progress in ${c.name}`} tone={enrollment?.completedAt ? "success" : "primary"} className="mt-1.5" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Trophy}
              title={openChallenges ? `${openChallenges} open to join` : "No active challenges"}
              action={<ButtonLink href="/challenges" variant="secondary">Browse challenges</ButtonLink>}
            >
              Join a team or go solo. Activity you log counts automatically.
            </EmptyState>
          )}
        </Card>
      </div>

      {/* Paths and goals */}
      <section aria-labelledby="paths-heading">
        <h2 id="paths-heading" className="mb-3 text-lg font-bold">
          Your paths
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {WELLNESS_PATHS.map((path) => {
            const goal = member.goals[path];
            return (
              <Link key={path} href={`/explore?path=${path}`} className="group">
                <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-pop">
                  <Badge tone={path} className="self-start">
                    {PATHS[path].label}
                  </Badge>
                  {goal ? (
                    <p className="mt-3 flex items-start gap-2 font-semibold text-ink">
                      <Target className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                      <span>
                        <span className="sr-only">Your goal: </span>
                        {goal}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 font-semibold text-ink">{PATHS[path].tagline}</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
                    Explore {PATHS[path].label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
