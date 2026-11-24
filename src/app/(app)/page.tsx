import Link from "next/link";
import { ArrowRight, CalendarCheck, Sparkles, Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { currentPlanYear, PATHS, type WellnessPath } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const { total, nextTier } = await getPointsSummary(user.id, planYear);
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Denver" }).format(new Date()));
  const firstName = user.firstName || user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-ink-muted">
          {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Denver" }).format(new Date())}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {greeting(hour)}, {firstName}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Points */}
        <Card className="lg:col-span-1">
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

        {/* For you */}
        <Card className="lg:col-span-2">
          <CardHeader title="For you" description="Picked from your interests and goals" action={<Badge tone="primary">Phase 1</Badge>} />
          <EmptyState icon={Sparkles} title="Personalized picks are coming">
            Tell us what you&apos;re interested in and we&apos;ll fill this space with content, habits and events chosen for you.
          </EmptyState>
        </Card>

        {/* Challenges */}
        <Card className="lg:col-span-2">
          <CardHeader title="Your challenges" action={<Badge tone="primary">Phase 2</Badge>} />
          <EmptyState
            icon={Trophy}
            title="No active challenges yet"
            action={<ButtonLink href="/challenges" variant="secondary">Browse challenges</ButtonLink>}
          >
            Join a team or go solo — live leaderboards and milestones are on the way.
          </EmptyState>
        </Card>

        {/* Habits */}
        <Card>
          <CardHeader title="Today’s habits" action={<Badge tone="primary">Phase 1</Badge>} />
          <EmptyState icon={CalendarCheck} title="Build a streak">
            Small daily habits you can check off for points.
          </EmptyState>
        </Card>
      </div>

      {/* Paths */}
      <section aria-labelledby="paths-heading">
        <h2 id="paths-heading" className="mb-3 text-lg font-bold">
          Explore your paths
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(PATHS) as WellnessPath[]).map((path) => (
            <Link key={path} href={`/explore#${path}`} className="group">
              <Card className="h-full p-5 transition-shadow group-hover:shadow-pop">
                <Badge tone={path}>{PATHS[path].label}</Badge>
                <p className="mt-3 font-semibold text-ink">{PATHS[path].tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
