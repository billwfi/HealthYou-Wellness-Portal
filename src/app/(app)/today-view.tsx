import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Compass, Flame, Gift, Mountain, Plus, Sparkles, Trophy } from "lucide-react";
import { isJoinable } from "@/lib/challenges";
import { toggleHabitToday } from "./actions";
import type { TodayData } from "./today-data";
import { cn } from "@/lib/utils";
import { PROGRAM_TIME_ZONE } from "@/lib/dates";
import { WELLNESS_PATHS } from "@/lib/domain";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { ContentCard } from "@/components/content/content-card";
import { ActionButton } from "@/components/content/action-button";
import { EventRow } from "@/components/events/event-row";
import { phaseLabel, scoreText } from "@/components/challenges/challenge-card";
import { PathCard } from "@/components/brand/path-card";
import { CHALLENGES_PHOTO, HERO_PHOTO } from "@/components/brand/photos";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const linkClass = "text-sm font-semibold text-primary hover:underline";

/** The Today page's markup; data comes from page.tsx (or sample data in a preview). */
export function TodayView({ data }: { data: TodayData }) {
  const { firstName, planYear, total, nextTier, picks, habits, member, events, challengeItems, now, today } = data;
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: PROGRAM_TIME_ZONE }).format(now));
  const habitsDone = habits.filter((h) => h.doneToday).length;
  const bestStreak = Math.max(0, ...habits.map((h) => h.streak));
  const myChallenges = challengeItems.filter((i) => i.enrollment && isJoinable(i.phase));
  const openChallenges = challengeItems.filter((i) => !i.enrollment && isJoinable(i.phase)).length;

  const heroStats = [
    { label: `${planYear} points`, value: total.toLocaleString(), sub: nextTier ? `${(nextTier.threshold - total).toLocaleString()} to ${nextTier.label}` : "Every tier unlocked" },
    { label: "Habits today", value: habits.length ? `${habitsDone}/${habits.length}` : "–", sub: bestStreak ? `${bestStreak}-day best streak` : "Start a streak" },
    { label: "Challenges", value: String(myChallenges.length), sub: openChallenges ? `${openChallenges} open to join` : "Joined" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section aria-labelledby="greeting" className="relative isolate overflow-hidden rounded-3xl shadow-pop">
        <Image src={HERO_PHOTO} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 1100px, 100vw" className="-z-10 object-cover object-[center_40%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-peak-navy/95 via-peak-navy/70 to-peak-navy/10" aria-hidden />
        <div className="grid grid-cols-1 gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-10">
          <div className="min-w-0 max-w-xl text-white">
            <p className="text-sm font-semibold text-white/80">
              {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: PROGRAM_TIME_ZONE }).format(now)}
            </p>
            <h1 id="greeting" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {greeting(hour)}, {firstName}
            </h1>
            <p className="mt-2 text-base text-white/85 sm:text-lg">Every step counts on the climb. Here&apos;s what&apos;s waiting for you today.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/progress#log" className={cn(buttonClasses({ size: "lg" }), "bg-white text-peak-navy shadow-md hover:bg-white/90")}>
                <Plus className="size-5" aria-hidden /> Log activity
              </Link>
              <Link href="/challenges" className={cn(buttonClasses({ size: "lg", variant: "ghost" }), "border border-white/50 text-white hover:bg-white/15 hover:text-white")}>
                <Trophy className="size-5" aria-hidden /> Challenges
              </Link>
            </div>
          </div>
          <dl className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3 lg:w-[420px]">
            {heroStats.map((s) => (
              <div key={s.label} className="min-w-0 rounded-2xl border border-white/20 bg-white/15 p-2.5 text-white backdrop-blur-md sm:p-4">
                <dt className="truncate text-[11px] font-semibold text-white/75 sm:text-xs">{s.label}</dt>
                <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{s.value}</dd>
                <dd className="mt-0.5 text-[10px] leading-tight text-white/75 sm:text-[11px]">{s.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="peak-stripe h-1.5" aria-hidden />
      </section>

      {/* Paths */}
      <section aria-labelledby="paths-heading" className="space-y-4">
        <SectionTitle id="paths-heading" icon={Mountain} tone="green" title="Your paths" description="Body, Life and Mind, with the goals you set" />
        <div className="grid gap-4 sm:grid-cols-3">
          {WELLNESS_PATHS.map((path) => (
            <PathCard key={path} path={path} goal={member.goals[path]} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Habits */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            icon={Flame}
            tone="orange"
            title="Today’s habits"
            description={habits.length ? `${habitsDone} of ${habits.length} done` : "Small wins, every day"}
            action={
              <Link href="/welcome" className={linkClass}>
                Edit
              </Link>
            }
          />
          {habits.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
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
                        className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2", h.doneToday ? "border-success bg-success text-white" : "border-border")}
                        aria-hidden
                      >
                        {h.doneToday && <Check className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm font-semibold", h.doneToday ? "text-ink-muted" : "text-ink")}>{h.title}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                          {h.streak > 0 ? (
                            <span className="inline-flex items-center gap-0.5 font-semibold text-peak-orange">
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
            <EmptyState icon={Flame} title="Build a streak" action={<ButtonLink href="/welcome" variant="secondary">Choose habits</ButtonLink>}>
              Small daily habits you can check off for points.
            </EmptyState>
          )}
        </Card>

        {/* Points */}
        <Card className="overflow-hidden">
          <div className="bg-linear-to-br from-peak-blue to-peak-navy p-5 text-white">
            <SectionTitle icon={Gift} tone="orange" title={`${planYear} rewards`} className="[&_h2]:text-white" />
            <div className="mt-4 flex items-center gap-5">
              <div className="rounded-full bg-white p-1">
                <ProgressRing value={total} max={nextTier?.threshold ?? Math.max(total, 1)} size={104} label="Points toward next reward">
                  <span className="text-peak-navy">
                    <span className="block text-xl font-extrabold">{total.toLocaleString()}</span>
                    <span className="block text-[11px] text-slate-500">points</span>
                  </span>
                </ProgressRing>
              </div>
              <div className="text-sm">
                {nextTier ? (
                  <>
                    <p className="text-lg font-extrabold">{(nextTier.threshold - total).toLocaleString()} to go</p>
                    <p className="text-white/80">
                      until <span className="font-semibold text-white">{nextTier.label}</span>: {nextTier.reward}
                    </p>
                  </>
                ) : (
                  <p className="text-white/85">You&apos;ve unlocked every reward tier this year.</p>
                )}
              </div>
            </div>
          </div>
          <Link href="/rewards" className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-primary hover:bg-surface-muted">
            Ways to earn <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </div>

      {/* For you */}
      <section aria-labelledby="for-you-heading" className="space-y-4">
        <SectionTitle
          id="for-you-heading"
          icon={Sparkles}
          tone="blue"
          title="For you"
          description="Picked from your interests and goals"
          action={
            <Link href="/explore" className={linkClass}>
              See all
            </Link>
          }
        />
        {picks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {picks.map((p) => (
              <ContentCard key={p.item.id} item={p.item} reason={p.reason} saved={p.saved} dismissible />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState icon={Compass} title="You've caught up" action={<ButtonLink href="/welcome" variant="secondary">Update interests</ButtonLink>}>
              You&apos;ve completed or hidden everything we&apos;d suggest right now. Add interests to see more.
            </EmptyState>
          </Card>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Challenges */}
        <Card className="overflow-hidden">
          <div className="relative isolate h-32">
            <Image src={CHALLENGES_PHOTO} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 360px, 100vw" className="-z-10 object-cover object-[center_60%]" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-peak-navy/90 to-peak-navy/10" aria-hidden />
            <div className="flex h-full items-end justify-between gap-3 p-4 text-white">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Trophy className="size-5 text-peak-orange" aria-hidden /> Your challenges
              </h2>
              <Link href="/challenges" className="text-sm font-semibold text-white/90 hover:underline">
                {myChallenges.length ? "All" : "Browse"}
              </Link>
            </div>
          </div>
          {myChallenges.length ? (
            <ul className="space-y-4 p-5">
              {myChallenges.slice(0, 3).map(({ challenge: c, summary, enrollment, phase }) => (
                <li key={c.id}>
                  <Link href={`/challenges/${c.slug}`} className="group block">
                    <span className="block truncate text-sm font-semibold text-ink group-hover:text-primary">{c.name}</span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-ink-muted">
                      <span>
                        {summary ? scoreText(summary.score, c.type, c.metric) : ""}
                        {summary?.goal != null && summary.pct != null ? ` of ${scoreText(summary.goal, c.type, c.metric)}` : ""}
                      </span>
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
            <div className="p-5 text-sm">
              <p className="font-semibold text-ink">{openChallenges ? `${openChallenges} open to join` : "No active challenges right now"}</p>
              <p className="mt-1 text-ink-muted">Join a team or go solo. Activity you log counts automatically.</p>
              <ButtonLink href="/challenges" variant="secondary" size="sm" className="mt-4">
                Browse challenges
              </ButtonLink>
            </div>
          )}
        </Card>

        {/* Events */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            icon={CalendarDays}
            tone="red"
            title="Upcoming events"
            description="All times Mountain"
            action={
              events.length > 0 && (
                <Link href="/events" className={linkClass}>
                  See all
                </Link>
              )
            }
          />
          {events.length ? (
            <ul className="mt-5 space-y-5">
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
      </div>
    </div>
  );
}
