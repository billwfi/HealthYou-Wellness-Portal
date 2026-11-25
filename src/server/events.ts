import "server-only";
import { db } from "@/db";
import { programToday } from "@/lib/dates";

/** Events from today on, soonest first. */
export async function getUpcomingEvents({ limit }: { limit?: number } = {}) {
  return db.event.findMany({
    where: { eventDate: { gte: programToday() } },
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    take: limit,
  });
}

export type UpcomingEvent = Awaited<ReturnType<typeof getUpcomingEvents>>[number];
