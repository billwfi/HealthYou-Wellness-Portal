"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { EVENT_TYPES } from "@/lib/domain";
import { dateOnly, programToday } from "@/lib/dates";
import { timeOnly } from "@/lib/events";
import { audit } from "@/server/audit";

export type EventFormState = { error: string | null; fieldErrors: Partial<Record<string, string>> };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max.toLocaleString()} characters.`)
    .transform((s) => s || null);

const optionalTime = z
  .string()
  .trim()
  .refine((s) => s === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(s), "Use a valid time.")
  .transform((s) => s || null);

const EventInput = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(300, "Keep the title under 300 characters."),
    provider: optionalText(200),
    description: optionalText(10_000),
    eventDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
      .transform(dateOnly),
    startTime: optionalTime,
    endTime: optionalTime,
    location: optionalText(300),
    url: optionalText(1000).refine((u) => u == null || /^https?:\/\/\S+$/i.test(u), "Links must start with http:// or https://"),
    eventType: z.enum(EVENT_TYPES, { error: "Choose a type." }),
    points: z
      .string()
      .trim()
      .transform((s) => (s === "" ? 0 : Number(s)))
      .pipe(z.number().int("Use a whole number.").min(0, "Can't be negative.").max(1000, "At most 1000.")),
  })
  .refine((v) => !v.endTime || v.startTime, { message: "Add a start time too.", path: ["startTime"] })
  // "HH:MM" strings compare correctly as text.
  .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, { message: "End must be after the start.", path: ["endTime"] });

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveEvent(id: number | null, _prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const admin = await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "");
  const parsed = EventInput.safeParse({
    title: text("title"),
    provider: text("provider"),
    description: text("description"),
    eventDate: text("eventDate"),
    startTime: text("startTime"),
    endTime: text("endTime"),
    location: text("location"),
    url: text("url"),
    eventType: text("eventType"),
    points: text("points"),
  });
  if (!parsed.success) {
    const fieldErrors: EventFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const { startTime, endTime, ...rest } = parsed.data;
  const data = { ...rest, startTime: startTime ? timeOnly(startTime) : null, endTime: endTime ? timeOnly(endTime) : null };

  if (id != null && !(await db.event.findUnique({ where: { id }, select: { id: true } }))) {
    return { error: "This event no longer exists.", fieldErrors: {} };
  }

  const saved = await db.$transaction(async (tx) => {
    const row = id == null ? await tx.event.create({ data }) : await tx.event.update({ where: { id }, data });
    await audit(admin.id, id == null ? "event.create" : "event.update", "event", row.id, { title: row.title, date: text("eventDate") }, tx);
    return row;
  });

  refresh();
  redirect(`/admin/events?saved=${saved.id}${saved.eventDate < programToday() ? "&when=past" : ""}`);
}

export async function deleteEvent(id: number) {
  const admin = await requireAdmin();
  const event = await db.event.findUnique({ where: { id }, select: { id: true, title: true } });
  if (event) {
    await db.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: event.id } });
      await audit(admin.id, "event.delete", "event", event.id, { title: event.title }, tx);
    });
    refresh();
  }
  redirect("/admin/events?deleted=1");
}
