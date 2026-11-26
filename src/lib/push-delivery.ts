// Web Push delivery, shared by the app (src/server/push.ts) and the scheduled
// reminder script (scripts/send-reminders.ts), so it takes the Prisma client as
// an argument instead of importing the server-only one.
import webpush from "web-push";
import type { PrismaClient } from "@/generated/prisma/client";

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

/** Which member preference gates this message. "account" (rewards, screenings) is always on. */
export type PushKind = "news" | "reminder" | "account";

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let ready = false;
function configure() {
  if (ready) return;
  // The subject tells push services who to contact: the app's https URL works.
  const subject = process.env.VAPID_SUBJECT || process.env.BETTER_AUTH_URL || "https://localhost";
  webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  ready = true;
}

/**
 * Send one payload to every device of the given members who allow this kind.
 * Expired subscriptions (404/410) are removed. Returns members reached and devices delivered.
 */
export async function deliver(db: PrismaClient, userIds: string[], payload: PushPayload, kind: PushKind) {
  if (!pushConfigured() || userIds.length === 0) return { recipients: 0, delivered: 0 };
  configure();
  const prefs = kind === "news" ? { notifyNews: true } : kind === "reminder" ? { notifyReminders: true } : {};
  const subs: { id: number; userId: string; endpoint: string; p256dh: string; auth: string }[] = [];
  // SQL Server caps a query at 2,100 parameters: look members up in chunks.
  for (let i = 0; i < userIds.length; i += 1000) {
    subs.push(
      ...(await db.pushSubscription.findMany({
        where: { userId: { in: userIds.slice(i, i + 1000) }, ...(kind === "account" ? {} : { user: { profile: prefs } }) },
        select: { id: true, userId: true, endpoint: true, p256dh: true, auth: true },
      })),
    );
  }

  const body = JSON.stringify({ ...payload, url: payload.url || "/" });
  const ok: number[] = [];
  const gone: number[] = [];
  const reached = new Set<string>();
  for (let i = 0; i < subs.length; i += 25) {
    await Promise.all(
      subs.slice(i, i + 25).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 24 });
          ok.push(s.id);
          reached.add(s.userId);
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) gone.push(s.id);
          else console.error(`push to subscription ${s.id} failed (${code ?? "network"})`);
        }
      }),
    );
  }
  if (gone.length) await db.pushSubscription.deleteMany({ where: { id: { in: gone } } });
  for (let i = 0; i < ok.length; i += 1000) {
    await db.pushSubscription.updateMany({ where: { id: { in: ok.slice(i, i + 1000) } }, data: { lastSuccessAt: new Date() } });
  }
  return { recipients: reached.size, delivered: ok.length };
}
