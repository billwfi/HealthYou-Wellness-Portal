import "server-only";
import { db } from "@/db";
import { deliver, pushConfigured, type PushKind, type PushPayload } from "@/lib/push-delivery";

export { pushConfigured };

/** The public VAPID key the browser needs to subscribe (null when push isn't set up). */
export function vapidPublicKey() {
  return pushConfigured() ? process.env.VAPID_PUBLIC_KEY! : null;
}

/** Notify members; never throws, so a push outage can't break the action that triggered it. */
export async function notify(userIds: string[], payload: PushPayload, kind: PushKind) {
  try {
    return await deliver(db, userIds, payload, kind);
  } catch (err) {
    console.error("push delivery failed", err);
    return { recipients: 0, delivered: 0 };
  }
}
