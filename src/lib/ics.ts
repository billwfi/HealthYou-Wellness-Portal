// Minimal iCalendar (RFC 5545) file for one event, with Colorado's time zone
// spelled out so Outlook places it correctly.

type IcsEvent = {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  /** @db.Date value (UTC midnight of the calendar day). */
  date: Date;
  /** TIME values (wall-clock in Denver, read from UTC parts); null = all day. */
  start: Date | null;
  end: Date | null;
};

const DENVER_VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Denver",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0700",
  "TZOFFSETTO:-0600",
  "TZNAME:MDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0600",
  "TZOFFSETTO:-0700",
  "TZNAME:MST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const hms = (t: Date) => `${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;

function escapeText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lines over 75 octets are folded with CRLF + space. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcs(e: IcsEvent, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  let when: string[];
  if (e.start) {
    const end = e.end ?? new Date(e.start.getTime() + 3_600_000);
    when = [`DTSTART;TZID=America/Denver:${ymd(e.date)}T${hms(e.start)}`, `DTEND;TZID=America/Denver:${ymd(e.date)}T${hms(end)}`];
  } else {
    const next = new Date(e.date.getTime() + 86_400_000);
    when = [`DTSTART;VALUE=DATE:${ymd(e.date)}`, `DTEND;VALUE=DATE:${ymd(next)}`];
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Reach Your Peak//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...(e.start ? DENVER_VTIMEZONE : []),
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    ...(e.url ? [`URL:${e.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
