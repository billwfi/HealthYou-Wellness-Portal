import type { Metadata } from "next";
import { Activity, Footprints, Timer, Trash2, Utensils } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { addDays, programDay, programToday } from "@/lib/dates";
import { ACTIVITY_BACKFILL_DAYS } from "@/lib/challenges";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/content/action-button";
import { LogActivityForm } from "./log-form";
import { deleteActivity } from "./actions";

export const metadata: Metadata = { title: "Progress" };

const HISTORY_DAYS = 14;

export default async function ProgressPage() {
  const user = await requireUser();
  const today = programToday();
  const weekStart = addDays(today, -6);

  const [types, entries, points] = await Promise.all([
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
  ]);
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
      <PageHeader eyebrow="Progress" title="Your activity" description="Log exercise and nutrition. It counts toward points and any challenges you've joined." />

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
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description={`Last ${HISTORY_DAYS} days`} />
          {entries.length ? (
            <div className="divide-y divide-border">
              {[...byDay].map(([time, list]) => (
                <section key={time} className="px-5 py-4" aria-label={dayLabel(new Date(time))}>
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
                            {e.notes && <span className="block truncate text-xs text-ink-subtle">{e.notes}</span>}
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
                </section>
              ))}
            </div>
          ) : (
            <EmptyState icon={Activity} title="Nothing logged yet">
              Log a walk, a workout or your fruit and veggies to start earning points.
            </EmptyState>
          )}
        </Card>
      </div>
    </>
  );
}
