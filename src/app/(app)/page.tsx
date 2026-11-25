import Link from "next/link";
import { ArrowRight, Check, Flame, Sparkles, Target, Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { getRecommendations } from "@/server/recommendations";
import { getTodayHabits } from "@/server/habits";
import { getMemberContext } from "@/server/member";
import { toggleHabitToday } from "./actions";
import { cn, currentPlanYear, PATHS } from "@/lib/utils";
import { PROGRAM_TIME_ZONE } from "@/lib/dates";
import { WELLNESS_PATHS } from "@/lib/domain";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ContentCard } from "@/components/content/content-card";
import { ActionButton } from "@/components/content/action-button";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const [{ total, nextTier }, picks, habits, member] = await Promise.all([
    getPointsSummary(user.id, planYear),
    getRecommendations(user.id, { limit: 4 }),
    getTodayHabits(user.id),
    getMemberContext(user.id),
  ]);
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: PROGRAM_TIME_ZONE }).format(now));
  const firstName = user.firstName || user.name.split(" ")[0];
  const habitsDone = habits.filter((h) => h.doneToday).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-ink-muted">
          {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: PROGRAM_TIME_ZONE }).format(now)}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {greeting(hour)}, {firstName}
        </h1>
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

        {/* Challenges */}
        <Card className="lg:col-span-3">
          <CardHeader title="Your challenges" action={<Badge tone="primary">Coming soon</Badge>} />
          <EmptyState
            icon={Trophy}
            title="No active challenges yet"
            action={<ButtonLink href="/challenges" variant="secondary">Browse challenges</ButtonLink>}
          >
            Join a team or go solo. Live leaderboards and milestones are on the way.
          </EmptyState>
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
