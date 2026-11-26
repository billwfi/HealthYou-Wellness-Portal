import { CalendarDays, GraduationCap, MonitorPlay, Presentation, Stethoscope, type LucideIcon } from "lucide-react";
import type { EventType } from "./domain";

// Event times are wall-clock times in Colorado. They're stored in TIME columns,
// which Prisma reads as 1970-01-01 at that time in UTC, so always use the UTC parts.

export const EVENT_TYPE_META: Record<EventType, { label: string; icon: LucideIcon }> = {
  webinar: { label: "Webinar", icon: MonitorPlay },
  workshop: { label: "Workshop", icon: Presentation },
  class: { label: "Class", icon: GraduationCap },
  screening: { label: "Screening", icon: Stethoscope },
  other: { label: "Event", icon: CalendarDays },
};

export function eventTypeMeta(type: string) {
  return EVENT_TYPE_META[type as EventType] ?? EVENT_TYPE_META.other;
}

/** "HH:MM" → TIME column value. */
export function timeOnly(hhmm: string) {
  return new Date(`1970-01-01T${hhmm}:00Z`);
}

/** TIME column value → "HH:MM" for <input type="time">. */
export function timeInput(t: Date | null) {
  return t ? t.toISOString().slice(11, 16) : "";
}

/** TIME column value → "9:30 AM". */
export function formatTime(t: Date) {
  const h = t.getUTCHours();
  const m = t.getUTCMinutes();
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

export function formatTimeRange(start: Date | null, end: Date | null) {
  if (!start) return "All day";
  if (!end) return formatTime(start);
  const a = formatTime(start);
  const b = formatTime(end);
  // "9–10 AM" when both share AM/PM.
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`;
}

/** @db.Date value → parts for a calendar tile. */
export function dateParts(day: Date) {
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...o, timeZone: "UTC" }).format(day);
  return { month: fmt({ month: "short" }), day: fmt({ day: "numeric" }), weekday: fmt({ weekday: "short" }), long: fmt({ weekday: "long", month: "long", day: "numeric" }) };
}
