import "server-only";
import { db } from "@/db";
import { addDays, programToday } from "@/lib/dates";

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

/** Active minutes per week (Monday start) for the last `weeks` weeks, oldest first. */
export async function getWeeklyMinutes(userId: string, weeks = 8) {
  const today = programToday();
  const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
  const start = addDays(monday, -7 * (weeks - 1));
  const entries = await db.activityEntry.findMany({
    where: { userId, entryDate: { gte: start, lte: today }, activityType: { metric: "active_minutes" } },
    select: { entryDate: true, value: true },
  });
  const totals = Array.from({ length: weeks }, () => 0);
  for (const e of entries) {
    const i = Math.floor((e.entryDate.getTime() - start.getTime()) / (7 * 86_400_000));
    if (i >= 0 && i < weeks) totals[i] += Number(e.value.toString());
  }
  return totals.map((value, i) => {
    const weekStart = addDays(start, 7 * i);
    const current = i === weeks - 1;
    return {
      key: weekStart.toISOString().slice(0, 10),
      label: current ? "This wk" : fmtDay(weekStart),
      value: Math.round(value),
      tooltip: `${current ? "This week" : `Week of ${fmtDay(weekStart)}`}: ${Math.round(value).toLocaleString()} active minutes`,
    };
  });
}

/** For each active habit: which of the last `days` days were checked off. */
export async function getHabitCalendar(userId: string, days = 28) {
  const today = programToday();
  const start = addDays(today, -(days - 1));
  const [habits, logs] = await Promise.all([
    db.userHabit.findMany({ where: { userId, active: true }, include: { habit: { select: { id: true, title: true } } }, orderBy: { startedAt: "asc" } }),
    db.habitLog.findMany({ where: { userId, logDate: { gte: start, lte: today } }, select: { habitId: true, logDate: true } }),
  ]);
  const done = new Set(logs.map((l) => `${l.habitId}:${l.logDate.getTime()}`));
  const dayList = Array.from({ length: days }, (_, i) => addDays(start, i));
  return {
    days: dayList,
    habits: habits.map(({ habit }) => {
      const cells = dayList.map((d) => done.has(`${habit.id}:${d.getTime()}`));
      return { id: habit.id, title: habit.title, cells, count: cells.filter(Boolean).length };
    }),
  };
}
