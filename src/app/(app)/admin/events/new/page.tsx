import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { programDay } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "../event-form";
import { saveEvent } from "../actions";

export const metadata: Metadata = { title: "Admin: New event" };

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Events
      </Link>
      <PageHeader eyebrow="Admin" title="New event" />
      <EventForm
        action={saveEvent.bind(null, null)}
        initial={{
          title: "",
          provider: "",
          description: "",
          eventDate: programDay(),
          startTime: "",
          endTime: "",
          location: "",
          url: "",
          eventType: "webinar",
          points: "25",
        }}
      />
    </>
  );
}
