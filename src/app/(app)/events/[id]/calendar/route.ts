import { db } from "@/db";
import { getSession } from "@/lib/session";
import { buildIcs } from "@/lib/ics";
import { slugify } from "@/lib/slug";

/** "Add to calendar": a one-event .ics download. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new Response("Sign in required", { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  const event = await db.event.findUnique({ where: { id } });
  if (!event) return new Response("Not found", { status: 404 });

  const ics = buildIcs({
    uid: `event-${event.id}@reachyourpeak`,
    title: event.provider ? `${event.title} (${event.provider})` : event.title,
    description: [event.description, event.url].filter(Boolean).join("\n\n") || null,
    location: event.location ?? (event.url ? "Online" : null),
    url: event.url && /^https?:\/\//i.test(event.url) ? event.url : null,
    date: event.eventDate,
    start: event.startTime,
    end: event.endTime,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slugify(event.title, 60) || "event"}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
