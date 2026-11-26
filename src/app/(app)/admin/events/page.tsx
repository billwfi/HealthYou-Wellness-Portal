import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Plus } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { dateParts, eventTypeMeta, formatTimeRange } from "@/lib/events";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Admin: Events" };

type Search = Promise<{ when?: string; saved?: string; deleted?: string }>;

function tab(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
    active ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
  );
}

export default async function AdminEventsPage({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const sp = await searchParams;
  const past = sp.when === "past";
  const today = programToday();

  const [events, upcomingCount, pastCount] = await Promise.all([
    db.event.findMany({
      where: { eventDate: past ? { lt: today } : { gte: today } },
      orderBy: past ? [{ eventDate: "desc" }, { startTime: "desc" }] : [{ eventDate: "asc" }, { startTime: "asc" }],
      take: 200,
    }),
    db.event.count({ where: { eventDate: { gte: today } } }),
    db.event.count({ where: { eventDate: { lt: today } } }),
  ]);
  const savedEvent = sp.saved ? events.find((e) => String(e.id) === sp.saved) : undefined;

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Events"
        description="Webinars, workshops and classes on members' Today page and the Events page."
        action={
          <ButtonLink href="/admin/events/new">
            <Plus className="size-4" aria-hidden /> New event
          </ButtonLink>
        }
      />

      {(savedEvent || sp.deleted) && (
        <Notice className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          {savedEvent ? `Saved “${savedEvent.title}”.` : "Event deleted."}
        </Notice>
      )}

      <nav aria-label="When" className="flex gap-2">
        <Link href="/admin/events" className={tab(!past)} aria-current={!past ? "page" : undefined}>
          Upcoming <span className="font-normal">{upcomingCount}</span>
        </Link>
        <Link href="/admin/events?when=past" className={tab(past)} aria-current={past ? "page" : undefined}>
          Past <span className="font-normal">{pastCount}</span>
        </Link>
      </nav>

      <Card className="mt-4 overflow-hidden">
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Event</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Type</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Where</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((e) => {
                  const d = dateParts(e.eventDate);
                  const { label, icon: Icon } = eventTypeMeta(e.eventType);
                  return (
                    <tr key={e.id} className="hover:bg-surface-muted/60">
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="block font-semibold text-ink">
                          {d.weekday}, {d.month} {d.day}
                          {past && `, ${e.eventDate.getUTCFullYear()}`}
                        </span>
                        <span className="text-xs text-ink-muted">{formatTimeRange(e.startTime, e.endTime)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/events/${e.id}`} className="font-semibold text-ink hover:text-primary hover:underline">
                          {e.title}
                        </Link>
                        {e.provider && <span className="block text-xs text-ink-muted">{e.provider}</span>}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="inline-flex items-center gap-1 text-ink-muted">
                          <Icon className="size-4" aria-hidden /> {label}
                        </span>
                      </td>
                      <td className="hidden max-w-48 truncate px-4 py-3 text-ink-muted md:table-cell">{e.location ?? (e.url ? "Online" : "—")}</td>
                      <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{e.points || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={past ? "No past events" : "Nothing scheduled"}
            action={!past && <ButtonLink href="/admin/events/new" variant="secondary">New event</ButtonLink>}
          >
            {past ? "Events move here the day after they happen." : "Add a webinar, workshop or class and it appears on members' Today page."}
          </EmptyState>
        )}
      </Card>
    </>
  );
}
