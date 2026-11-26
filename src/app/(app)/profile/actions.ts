"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { notify } from "@/server/push";
import { hashSyncKey, newSyncKey, SHORTCUT_PROVIDER } from "@/server/step-sync";

type BrowserSubscription = { endpoint: string; keys: { p256dh: string; auth: string } };

const hash = (endpoint: string) => createHash("sha256").update(endpoint).digest("hex");

/** Save this device's push subscription (moving it to this member if it belonged to someone else). */
export async function subscribeDevice(sub: BrowserSubscription) {
  const user = await requireUser();
  const endpoint = String(sub?.endpoint ?? "");
  const p256dh = String(sub?.keys?.p256dh ?? "");
  const auth = String(sub?.keys?.auth ?? "");
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 2000 || !p256dh || p256dh.length > 200 || !auth || auth.length > 100) {
    return { ok: false as const };
  }
  const userAgent = (await headers()).get("user-agent")?.slice(0, 500) ?? null;
  const endpointHash = hash(endpoint);
  await db.pushSubscription.upsert({
    where: { endpointHash },
    create: { userId: user.id, endpointHash, endpoint, p256dh, auth, userAgent },
    update: { userId: user.id, p256dh, auth, userAgent },
  });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function unsubscribeDevice(endpoint: string) {
  const user = await requireUser();
  await db.pushSubscription.deleteMany({ where: { userId: user.id, endpointHash: hash(String(endpoint)) } });
  revalidatePath("/profile");
}

/** A test notification to the member's own devices. */
export async function sendTestNotification() {
  const user = await requireUser();
  const { delivered } = await notify([user.id], { title: "Notifications are on", body: "You'll hear from Reach Your Peak here.", url: "/profile", tag: "test" }, "account");
  return { delivered };
}

export async function saveNotificationPrefs(formData: FormData) {
  const user = await requireUser();
  const data = { notifyReminders: formData.get("reminders") === "on", notifyNews: formData.get("news") === "on" };
  await db.memberProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
  revalidatePath("/profile");
}

// ── iPhone step sync ─────────────────────────────────────────────────────────

/** Create (or replace) the member's personal sync key. The key is returned once and only its hash is kept. */
export async function createStepSyncKey() {
  const user = await requireUser();
  const key = newSyncKey();
  await db.deviceConnection.upsert({
    where: { userId_provider: { userId: user.id, provider: SHORTCUT_PROVIDER } },
    create: { userId: user.id, provider: SHORTCUT_PROVIDER, tokenHash: hashSyncKey(key), status: "connected" },
    update: { tokenHash: hashSyncKey(key), status: "connected", lastError: null },
  });
  revalidatePath("/profile");
  return { key };
}

/** Stop syncing. Steps already synced stay. */
export async function turnOffStepSync() {
  const user = await requireUser();
  await db.deviceConnection.deleteMany({ where: { userId: user.id, provider: SHORTCUT_PROVIDER } });
  revalidatePath("/profile");
  revalidatePath("/progress");
}
