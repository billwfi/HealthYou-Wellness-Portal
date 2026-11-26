import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, CalendarCheck, Footprints, HeartPulse, Target, Timer, Trash2, Utensils } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { addDays, programDay, programToday } from "@/lib/dates";
import { ACTIVITY_BACKFILL_DAYS, MANUAL_DAILY_LIMIT } from "@/lib/challenges";
import { PageBanner } from "@/components/brand/page-banner";
import { BANNERS } from "@/components/brand/photos";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/content/action-button";
import { SectionTitle } from "@/components/ui/section-title";
import { ColumnChart } from "@/components/charts/column-chart";
import { getHabitCalendar, getWeeklyMinutes } from "@/server/progress";
import { getBiometricHistory } from "@/server/screenings";
import { formatMarker, MARKERS, meetsTarget } from "@/lib/biometrics";
import { cn } from "@/lib/utils";
import { LogActivityForm } from "./log-form";
import { deleteActivity } from "./actions";

export const metadata: Metadata = { title: "Progress" };

const HISTORY_DAYS = 14;

export default async function ProgressPage() {
  const user = await requireUser();
  const today = programToday();
  const weekStart = addDays(today, -6);

  const [types, entries, points, weekly, calendar, bio] = await Promise.all([
    db.activityType.findMany({ where: { isActive: true }, orderBy: { id: "asc" }, select: { id: true, name: true, unit: true, metric: true, category: true } }),
    db.activityEntry.findMany({
      where: { userId: user.id, entryDate: { gte: addDays(today, -(HISTORY_DAYS - 1)) } },
      include: { activityType: true },
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
    }),
    db.pointsLedger.findMany({
      where: { userId: user.id, sourceType: "activity", occurredOn: { gte: addDays(today, -(HISTORY_DAYS - 1)) } },
      select: { sourceId: true, points: true },
    }),
    getWeeklyMinutes(user.id),
    getHabitCalendar(user.id),
    getBiometricHistory(user.id),
  ]);
  const stepSync = await db.deviceConnection.findFirst({ where: { userId: user.id, provider: "apple_health", status: "connected" }, select: { id: true } });
  const pointsFor = new Map(points.map((p) => [p.sourceId, p.points]));

  const week = { steps: 0, minutes: 0, workouts: 0, servings: 0 };
  for (const e of entries) {
    if (e.entryDate < weekStart) continue;
    const v = Number(e.value.toString());
    if (e.activityType.metric === "steps") week.steps += v;
    if (e.activityType.metric === "active_minutes") week.minutes += v;
    if (e.activityType.metric === "servings") week.servings += v;
    if (e.activityType.category === "physical_activity" && e.activityType.metric !== "steps") week.workouts += 1;
  }

  const byDay = new Map<number, typeof entries>();
  for (const e of entries) byDay.set(e.entryDate.getTime(), [...(byDay.get(e.entryDate.getTime()) ?? []), e]);
  const dayLabel = (d: Date) =>
    d.getTime() === today.getTime()
      ? "Today"
      : d.getTime() === addDays(today, -1).getTime()
        ? "Yesterday"
        : new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(d);

  const stats = [
    { label: "Steps", value: week.steps.toLocaleString(), icon: Footprints },
    { label: "Active minutes", value: week.minutes.toLocaleString(), icon: Timer },
    { label: "Workouts", value: week.workouts.toLocaleString(), icon: Activity },
    { label: "Servings", value: week.servings.toLocaleString(), icon: Utensils },
  ];

  return (
    <>
      <PageBanner photo={BANNERS.progress} eyebrow="Progress" title="Your activity" description="Log exercise and nutrition. It counts toward points and any challenges you've joined." />

      <section aria-labelledby="week-heading">
        <h2 id="week-heading" className="sr-only">
          Last 7 days
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <Icon className="size-4" aria-hidden /> {label}
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink">{value}</p>
              <p className="text-xs text-ink-subtle">last 7 days</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card id="log" className="scroll-mt-24 self-start">
          <CardHeader title="Log activity" description={`Today or up to ${ACTIVITY_BACKFILL_DAYS} days back`} />
          <CardBody>
            <LogActivityForm types={types} today={programDay()} earliest={addDays(today, -ACTIVITY_BACKFILL_DAYS).toISOString().slice(0, 10)} />
            <p className="mt-4 border-t border-border pt-4 text-sm text-ink-muted">
              You can type in up to {MANUAL_DAILY_LIMIT.steps.toLocaleString()} steps a day.{" "}
              {stepSync ? (
                <>Your iPhone sends your steps automatically.</>
              ) : (
                <>
                  On iPhone?{" "}
                  <Link href="/connect/steps" className="font-semibold text-primary hover:underline">
                    Sync your steps from Apple Health
                  </Link>
                  .
                </>
              )}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description={`Last ${HISTORY_DAYS} days`} />
          {entries.length ? (
            <div className="divide-y divide-border">
              {[...byDay].map(([time, list]) => (
                <div key={time} className="px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">{dayLabel(new Date(time))}</h3>
                  <ul className="mt-2 space-y-1">
                    {list.map((e) => {
                      const pts = pointsFor.get(String(e.id));
                      return (
                        <li key={e.id} className="flex items-center gap-3 text-sm">
                          <span className="min-w-0 flex-1">
                            <span className="font-semibold text-ink">{e.activityType.name}</span>
                            <span className="text-ink-muted">
                              {" "}
                              · {Number(e.value.toString()).toLocaleString()} {e.activityType.unit}
                            </span>
                            {e.source === "device" ? (
                              <span className="block text-xs text-ink-subtle">Synced from Apple Health</span>
                            ) : (
                              e.notes && <span className="block truncate text-xs text-ink-subtle">{e.notes}</span>
                            )}
                          </span>
                          {pts ? <span className="text-xs font-semibold text-primary">+{pts} pts</span> : null}
                          {e.source === "manual" && (
                            <form action={deleteActivity.bind(null, e.id)}>
                              <ActionButton
                                className="grid size-8 place-items-center rounded-full text-ink-subtle hover:bg-surface-muted hover:text-accent"
                                aria-label={`Delete ${e.activityType.name} entry`}
                                title="Delete"
                              >
                                <Trash2 className="size-4" aria-hidden />
                              </ActionButton>
                            </form>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Activity} title="Nothing logged yet">
              Log a walk, a workout or your fruit and veggies to start earning points.
            </EmptyState>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Weekly active minutes */}
        <Card className="p-5">
          <SectionTitle icon={Timer} tone="blue" title="Active minutes by week" description="Last 8 weeks, Monday to Sunday" />
          <div className="mt-4">
            {weekly.some((w) => w.value > 0) ? (
              <ColumnChart data={weekly} title="Active minutes by week, last 8 weeks" unit="Active minutes" />
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">Log a walk, run or workout and your weekly minutes will show up here.</p>
            )}
          </div>
        </Card>

        {/* Habit calendar */}
        <Card className="p-5">
          <SectionTitle icon={CalendarCheck} tone="orange" title="Habits, last 4 weeks" description="Each square is a day; filled means checked off" />
          {calendar.habits.length ? (
            <ul className="mt-4 space-y-3">
              {calendar.habits.map((h) => (
                <li key={h.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-semibold text-ink">{h.title}</span>
                    <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                      {h.count} of {calendar.days.length} days
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-[repeat(28,minmax(0,1fr))] gap-[2px]" aria-hidden>
                    {h.cells.map((done, i) => (
                      <span
                        key={i}
                        title={`${new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(calendar.days[i])}: ${done ? "done" : "not done"}`}
                        className={cn("aspect-square rounded-[3px]", done ? "bg-chart-1" : "bg-surface-muted")}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-ink-muted">
              <Link href="/welcome" className="font-semibold text-primary hover:underline">Choose a few habits</Link> to start building streaks.
            </p>
          )}
        </Card>
      </div>

      {/* Health numbers */}
      <Card className="mt-6 p-5">
        <SectionTitle
          icon={HeartPulse}
          tone="red"
          title="Your health numbers"
          description="For your own tracking. Rewards come from taking part, never from your results."
          action={
            <Link href="/progress/health" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {bio.series.size ? "Trends & targets" : "Add a screening"} <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        {bio.series.size ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MARKERS.filter((m) => bio.series.has(m.key)).slice(0, 8).map((m) => {
              const list = bio.series.get(m.key)!;
              const latest = list[list.length - 1];
              const goal = bio.goals.get(m.key);
              return (
                <div key={m.key} className="rounded-xl bg-surface-muted p-3">
                  <dt className="truncate text-xs text-ink-muted">{m.label}</dt>
                  <dd className="mt-0.5 text-lg font-bold tabular-nums text-ink">{formatMarker(latest.value, m.key)}</dd>
                  {goal && (
                    <dd className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <Target className="size-3.5" aria-hidden />
                      {meetsTarget(latest.value, goal.target, goal.direction) ? "At your target" : `Target ${goal.direction === "above" ? "≥" : "≤"} ${formatMarker(goal.target, m.key)}`}
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">
            Results from your biometric screening appear here. A verified screening earns your yearly screening points.
          </p>
        )}
      </Card>
    </>
  );
}
