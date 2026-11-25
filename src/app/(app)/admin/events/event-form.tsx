"use client";

import Link from "next/link";
import { startTransition, useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/auth/field";
import { control, FieldShell, invalidProps } from "@/components/admin/form-fields";
import { EVENT_TYPES, type EventType } from "@/lib/domain";
import { EVENT_TYPE_META } from "@/lib/events";
import { cn } from "@/lib/utils";
import { deleteEvent, type EventFormState } from "./actions";

export type EventFormValues = {
  title: string;
  provider: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  url: string;
  eventType: EventType;
  points: string;
};

export function EventForm({
  action,
  initial,
  eventId,
}: {
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  initial: EventFormValues;
  /** Set when editing: enables delete. */
  eventId?: number;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null, fieldErrors: {} });
  const [deleting, startDelete] = useTransition();
  const fe = state.fieldErrors;
  const input = (id: keyof EventFormValues) => ({ id, name: id, defaultValue: initial[id], ...invalidProps(id, fe[id]) });

  return (
    <form
      // Submit by hand so a failed save keeps what the admin typed (React resets forms after `action`).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
    >
      <Card className="space-y-5 p-5">
        <FieldShell id="title" label="Title" error={fe.title}>
          <input {...input("title")} maxLength={300} required className={cn(control, "h-11")} />
        </FieldShell>
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldShell id="eventDate" label="Date" error={fe.eventDate}>
            <input {...input("eventDate")} type="date" required className={cn(control, "h-11")} />
          </FieldShell>
          <FieldShell id="startTime" label="Starts" optional error={fe.startTime} hint="Mountain Time">
            <input {...input("startTime")} type="time" className={cn(control, "h-11")} />
          </FieldShell>
          <FieldShell id="endTime" label="Ends" optional error={fe.endTime} hint="Blank start = all day">
            <input {...input("endTime")} type="time" className={cn(control, "h-11")} />
          </FieldShell>
        </div>
        <FieldShell id="description" label="Description" optional error={fe.description}>
          <textarea {...input("description")} rows={6} className={cn(control, "py-2.5 leading-relaxed")} />
        </FieldShell>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldShell id="location" label="Location" optional error={fe.location} hint="Leave blank for online events.">
            <input {...input("location")} maxLength={300} placeholder="e.g. City Hall, Room 102" className={cn(control, "h-11")} />
          </FieldShell>
          <FieldShell id="url" label="Join or details link" optional error={fe.url}>
            <input {...input("url")} type="url" maxLength={1000} placeholder="https://" className={cn(control, "h-11")} />
          </FieldShell>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <FieldShell id="eventType" label="Type" error={fe.eventType}>
            <select {...input("eventType")} className={cn(control, "h-11")}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell id="provider" label="Provider" optional error={fe.provider} hint="e.g. Nationwide, Profile EAP">
            <input {...input("provider")} maxLength={200} className={cn(control, "h-11")} />
          </FieldShell>
          <FieldShell id="points" label="Points" error={fe.points} hint="Shown to members. 0 = none.">
            <input {...input("points")} type="number" min={0} inputMode="numeric" className={cn(control, "h-11")} />
          </FieldShell>

          <FormError message={state.error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={pending || deleting} className="flex-1">
              {pending ? "Saving…" : eventId ? "Save changes" : "Create event"}
            </Button>
            <Link href="/admin/events" className={buttonClasses({ variant: "ghost" })}>
              Cancel
            </Link>
          </div>
        </Card>

        {eventId && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Delete</h2>
            <p className="mt-1 text-xs text-ink-muted">Removes this event for everyone. Calendar files members already downloaded aren&apos;t affected.</p>
            <button
              type="button"
              disabled={deleting || pending}
              onClick={() => {
                if (confirm(`Delete “${initial.title}”? This can't be undone.`)) startDelete(() => deleteEvent(eventId));
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden /> {deleting ? "Deleting…" : "Delete event"}
            </button>
          </Card>
        )}
      </div>
    </form>
  );
}
