import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import type { EventType } from "@/lib/domain";
import { timeInput } from "@/lib/events";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "../event-form";
import { saveEvent } from "../actions";

export const metadata: Metadata = { title: "Admin: Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <>
      <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Events
      </Link>
      <PageHeader eyebrow="Edit event" title={event.title} />
      <EventForm
        action={saveEvent.bind(null, event.id)}
        eventId={event.id}
        initial={{
          title: event.title,
          provider: event.provider ?? "",
          description: event.description ?? "",
          eventDate: event.eventDate.toISOString().slice(0, 10),
          startTime: timeInput(event.startTime),
          endTime: timeInput(event.endTime),
          location: event.location ?? "",
          url: event.url ?? "",
          eventType: (event.eventType as EventType) ?? "other",
          points: String(event.points),
        }}
      />
    </>
  );
}
