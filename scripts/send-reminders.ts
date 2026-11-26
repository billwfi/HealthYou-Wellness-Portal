// Evening reminders, run daily by the scheduled Container Apps job (infra/main.bicep).
//   npx tsx scripts/send-reminders.ts            # once per program day
//   npx tsx scripts/send-reminders.ts --force    # run again today anyway
//
// Each member with reminders on gets at most one notification, picked in order:
// a challenge they joined ends tomorrow, one starts tomorrow, or they haven't
// checked any of their habits today.
import { db } from "./db";
import { deliver, pushConfigured, type PushPayload } from "../src/lib/push-delivery";
import { addDays, programToday } from "../src/lib/dates";

async function main() {
  if (!pushConfigured()) {
    console.log("VAPID keys not set; nothing to do.");
    return;
  }
  const today = programToday();
  const tomorrow = addDays(today, 1);
  const startOfDay = new Date(Date.now() - 20 * 3600_000); // a run in the last 20 hours counts as today's
  if (!process.argv.includes("--force") && (await db.pushMessage.findFirst({ where: { kind: "reminder", createdAt: { gte: startOfDay } } }))) {
    console.log("Reminders already sent today; pass --force to send again.");
    return;
  }

  const members = await db.pushSubscription.findMany({
    where: { user: { profile: { notifyReminders: true } } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const ids = members.map((m) => m.userId);
  console.log(`${ids.length} member(s) with reminders on`);
  if (!ids.length) return;

  const picked = new Map<string, PushPayload>();
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    const [ending, starting, habitUsers, checkedToday] = await Promise.all([
      db.challengeEnrollment.findMany({
        where: { userId: { in: chunk }, challenge: { status: { in: ["scheduled", "active"] }, endDate: tomorrow } },
        select: { userId: true, challenge: { select: { name: true, slug: true } } },
      }),
      db.challengeEnrollment.findMany({
        where: { userId: { in: chunk }, challenge: { status: { in: ["scheduled", "active"] }, startDate: tomorrow } },
        select: { userId: true, challenge: { select: { name: true, slug: true } } },
      }),
      db.userHabit.findMany({ where: { userId: { in: chunk }, active: true }, select: { userId: true }, distinct: ["userId"] }),
      db.habitLog.findMany({ where: { userId: { in: chunk }, logDate: today }, select: { userId: true }, distinct: ["userId"] }),
    ]);
    for (const e of ending) {
      if (!picked.has(e.userId)) {
        picked.set(e.userId, { title: `Last day tomorrow: ${e.challenge.name}`, body: "Log today's activity so it counts before the challenge ends.", url: `/challenges/${e.challenge.slug}`, tag: "challenge" });
      }
    }
    for (const e of starting) {
      if (!picked.has(e.userId)) {
        picked.set(e.userId, { title: `${e.challenge.name} starts tomorrow`, body: "You're in. Everything you log from tomorrow counts.", url: `/challenges/${e.challenge.slug}`, tag: "challenge" });
      }
    }
    const checked = new Set(checkedToday.map((h) => h.userId));
    for (const h of habitUsers) {
      if (!picked.has(h.userId) && !checked.has(h.userId)) {
        picked.set(h.userId, { title: "Your habits are waiting", body: "Check off today's habits before the day ends to keep your streak going.", url: "/", tag: "habits" });
      }
    }
  }

  // Same message → one delivery call.
  const groups = new Map<string, { payload: PushPayload; userIds: string[] }>();
  for (const [userId, payload] of picked) {
    const key = JSON.stringify(payload);
    if (!groups.has(key)) groups.set(key, { payload, userIds: [] });
    groups.get(key)!.userIds.push(userId);
  }
  let recipients = 0;
  let delivered = 0;
  for (const { payload, userIds } of groups.values()) {
    const r = await deliver(db, userIds, payload, "reminder");
    recipients += r.recipients;
    delivered += r.delivered;
  }
  const habits = [...picked.values()].filter((p) => p.tag === "habits").length;
  const summary = `${habits} habit nudge${habits === 1 ? "" : "s"}, ${picked.size - habits} challenge reminder${picked.size - habits === 1 ? "" : "s"}`;
  await db.pushMessage.create({ data: { kind: "reminder", title: "Evening reminders", body: summary, url: null, recipients, delivered } });
  console.log(`${summary}; reached ${recipients} member(s) on ${delivered} device(s)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
