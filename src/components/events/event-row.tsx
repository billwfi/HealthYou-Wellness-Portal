import { CalendarPlus, ExternalLink, MapPin } from "lucide-react";
import { dateParts, eventTypeMeta, formatTimeRange } from "@/lib/events";
import { Badge } from "@/components/ui/badge";

type EventLike = {
  id: number;
  title: string;
  provider: string | null;
  description: string | null;
  eventDate: Date;
  startTime: Date | null;
  endTime: Date | null;
  location: string | null;
  url: string | null;
  eventType: string;
  points: number;
};

const linkClass = "inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline";

/** One event: date tile, details, and join / add-to-calendar links. */
export function EventRow({ event, today, showDescription = false }: { event: EventLike; today: Date; showDescription?: boolean }) {
  const d = dateParts(event.eventDate);
  const { label, icon: Icon } = eventTypeMeta(event.eventType);
  const isToday = event.eventDate.getTime() === today.getTime();
  const url = event.url && /^https?:\/\//i.test(event.url) ? event.url : null;

  return (
    <article className="flex gap-4">
      <div
        className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-center ${isToday ? "bg-primary text-on-primary" : "bg-primary-soft text-primary"}`}
        aria-hidden
      >
        <span className="text-[11px] font-bold uppercase tracking-wide">{isToday ? "Today" : d.month}</span>
        <span className="text-xl font-extrabold leading-none">{d.day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-ink">{event.title}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">
          <span className="sr-only">{d.long}, </span>
          {!isToday && <span aria-hidden>{d.weekday} · </span>}
          {formatTimeRange(event.startTime, event.endTime)}
          {event.provider && <> · {event.provider}</>}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Icon className="size-3.5" aria-hidden /> {label}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden /> {event.location}
            </span>
          )}
          {event.points > 0 && <Badge tone="primary">+{event.points} pts</Badge>}
        </div>
        {showDescription && event.description && <p className="mt-2 whitespace-pre-line text-sm text-ink">{event.description}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {event.eventType === "webinar" ? "Join" : "Details"} <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">: {event.title} (opens in a new tab)</span>
            </a>
          )}
          <a href={`/events/${event.id}/calendar`} className={linkClass} download>
            <CalendarPlus className="size-3.5" aria-hidden /> Add to calendar
            <span className="sr-only">: {event.title}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
