import "server-only";
import { db } from "@/db";
import { addDays, programToday } from "@/lib/dates";

const STREAK_LOOKBACK_DAYS = 90;

/** The member's active habits with today's status and current streak. */
export async function getTodayHabits(userId: string) {
  const today = programToday();
  const [habits, logs] = await Promise.all([
    db.userHabit.findMany({
      where: { userId, active: true, habit: { isActive: true } },
      include: { habit: true },
      orderBy: { startedAt: "asc" },
    }),
    db.habitLog.findMany({
      where: { userId, logDate: { gte: addDays(today, -STREAK_LOOKBACK_DAYS) } },
      select: { habitId: true, logDate: true },
    }),
  ]);

  const daysByHabit = new Map<number, Set<number>>();
  for (const log of logs) {
    const days = daysByHabit.get(log.habitId) ?? new Set<number>();
    days.add(log.logDate.getTime());
    daysByHabit.set(log.habitId, days);
  }

  return habits.map(({ habit }) => {
    const days = daysByHabit.get(habit.id) ?? new Set<number>();
    const doneToday = days.has(today.getTime());
    // A streak survives until the end of today, so count back from yesterday if today isn't done yet.
    let streak = 0;
    for (let d = doneToday ? today : addDays(today, -1); days.has(d.getTime()); d = addDays(d, -1)) streak++;
    return { ...habit, doneToday, streak };
  });
}
