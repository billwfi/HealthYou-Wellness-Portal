import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { getUpcomingEvents } from "@/server/events";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EventRow } from "@/components/events/event-row";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  await requireUser();
  const events = await getUpcomingEvents();
  const today = programToday();

  // Group by month for scanning.
  const months = new Map<string, typeof events>();
  for (const e of events) {
    const key = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(e.eventDate);
    months.set(key, [...(months.get(key) ?? []), e]);
  }

  return (
    <>
      <PageHeader eyebrow="Events" title="Upcoming events" description="Webinars, workshops and classes from Reach Your Peak and its partners. All times are Mountain Time." />
      {events.length ? (
        <div className="space-y-8">
          {[...months].map(([month, list], i) => (
            <section key={month} aria-labelledby={`month-${i}`}>
              <h2 id={`month-${i}`} className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-muted">
                {month}
              </h2>
              <Card className="divide-y divide-border">
                {list.map((e) => (
                  <div key={e.id} className="p-5">
                    <EventRow event={e} today={today} showDescription />
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={CalendarDays} title="No upcoming events">
            New webinars and workshops will show up here as they&apos;re scheduled.
          </EmptyState>
        </Card>
      )}
    </>
  );
}
