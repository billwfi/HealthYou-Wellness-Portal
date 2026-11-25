/** The program runs on Colorado time: "today" means today in Denver. */
export const PROGRAM_TIME_ZONE = "America/Denver";

/** YYYY-MM-DD for the program's calendar day containing `date`. */
export function programDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PROGRAM_TIME_ZONE }).format(date);
}

/** A calendar day as a UTC-midnight Date, the shape Prisma uses for @db.Date columns. */
export function dateOnly(isoDay: string) {
  return new Date(`${isoDay}T00:00:00Z`);
}

/** Today (program time) as a @db.Date value. */
export function programToday(date = new Date()) {
  return dateOnly(programDay(date));
}

/** `day` shifted by whole days (works on @db.Date values). */
export function addDays(day: Date, days: number) {
  return new Date(day.getTime() + days * 86_400_000);
}
