import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { addDays, dateOnly, programToday } from "@/lib/dates";
import { SYNC_STEPS_MAX } from "@/lib/challenges";
import { deviceLabel, parseTerraSignature, TERRA_PROVIDERS, terraDay, terraProviderKey } from "@/lib/terra";
import { recordSyncedSteps } from "@/server/step-sync";

const API = "https://access.tryterra.co/api/v2";

/** Synced days older than this are ignored (Terra backfills history on connect). */
const MAX_DAYS_BACK = 30;

/** Signatures older than this are rejected as replays. */
const SIGNATURE_TOLERANCE_S = 15 * 60;

/** "live" once the Terra credentials are set; otherwise a labeled demo. */
export function terraMode(): "live" | "demo" {
  return process.env.TERRA_DEV_ID && process.env.TERRA_API_KEY && process.env.TERRA_WEBHOOK_SECRET ? "live" : "demo";
}

function terraHeaders() {
  return { "dev-id": process.env.TERRA_DEV_ID!, "x-api-key": process.env.TERRA_API_KEY!, "Content-Type": "application/json" };
}

/** A Terra connect-widget link for this member. Apple Health and Health Connect go through Terra Grip. */
export async function createWidgetSession(userId: string, origin: string) {
  const res = await fetch(`${API}/widget/session`, {
    method: "POST",
    headers: terraHeaders(),
    body: JSON.stringify({
      reference_id: userId,
      providers: TERRA_PROVIDERS.map((p) => p.code).join(","),
      sdk_app: "grip",
      language: "en",
      auth_success_redirect_url: `${origin}/connect/devices/done`,
      auth_failure_redirect_url: `${origin}/connect/devices/done?failed=1`,
      auth_cancel_redirect_url: `${origin}/profile#devices`,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Terra widget session failed: ${res.status} ${await res.text().catch(() => "")}`);
  const body = (await res.json()) as { url?: string };
  if (!body.url) throw new Error("Terra widget session had no url");
  return body.url;
}

/** Disconnect at Terra (live mode) and forget the connection here. Synced steps stay. */
export async function disconnectDevice(userId: string, connectionId: number) {
  const c = await db.deviceConnection.findFirst({ where: { id: connectionId, userId, provider: { startsWith: "terra:" } } });
  if (!c) return;
  if (terraMode() === "live" && c.externalUserId && !c.externalUserId.startsWith("demo-")) {
    const res = await fetch(`${API}/auth/deauthenticateUser?user_id=${encodeURIComponent(c.externalUserId)}`, {
      method: "DELETE",
      headers: terraHeaders(),
      signal: AbortSignal.timeout(15_000),
    });
    // 404 means Terra already forgot this user; anything else is worth retrying later.
    if (!res.ok && res.status !== 404) throw new Error(`Terra deauth failed: ${res.status}`);
  }
  await db.deviceConnection.delete({ where: { id: c.id } });
}

/** Check X-Terra-Signature (HMAC-SHA256 of `${t}.${rawBody}`). */
export function verifyTerraSignature(rawBody: string, header: string | null, secret = process.env.TERRA_WEBHOOK_SECRET ?? "") {
  const sig = parseTerraSignature(header);
  if (!sig || !secret) return false;
  if (Math.abs(Date.now() / 1000 - sig.t) > SIGNATURE_TOLERANCE_S) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${sig.t}.${rawBody}`).digest("hex"));
  return sig.v1.some((v) => {
    const got = Buffer.from(v);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

type TerraUser = { user_id?: string; provider?: string; reference_id?: string | null };
type TerraDaily = { metadata?: { start_time?: string; upload_type?: number }; distance_data?: { steps?: number | null } };
export type TerraEvent = {
  type?: string;
  user?: TerraUser;
  old_user?: TerraUser;
  new_user?: TerraUser;
  reference_id?: string | null;
  message?: string;
  data?: TerraDaily[];
};

const findByTerraUser = (terraUserId: string | undefined) =>
  terraUserId ? db.deviceConnection.findFirst({ where: { externalUserId: terraUserId, provider: { startsWith: "terra:" } } }) : null;

/** Apply one Terra webhook event. Returns a short note for logs. */
export async function handleTerraEvent(event: TerraEvent): Promise<string> {
  switch (event.type) {
    case "auth": {
      const u = event.user;
      const userId = event.reference_id ?? u?.reference_id;
      if (!u?.user_id || !u.provider || !userId) return "auth: missing user";
      const member = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!member) return "auth: unknown reference_id";
      const provider = terraProviderKey(u.provider);
      await db.deviceConnection.upsert({
        where: { userId_provider: { userId, provider } },
        create: { userId, provider, externalUserId: u.user_id, status: "connected" },
        update: { externalUserId: u.user_id, status: "connected", lastError: null },
      });
      return `auth: ${provider}`;
    }
    case "user_reauth": {
      const c = await findByTerraUser(event.old_user?.user_id);
      if (!c || !event.new_user?.user_id) return "reauth: unknown user";
      await db.deviceConnection.update({ where: { id: c.id }, data: { externalUserId: event.new_user.user_id, status: "connected", lastError: null } });
      return "reauth";
    }
    case "deauth":
    case "access_revoked": {
      const c = await findByTerraUser(event.user?.user_id);
      if (c) await db.deviceConnection.delete({ where: { id: c.id } });
      return event.type;
    }
    case "connection_error": {
      const c = await findByTerraUser(event.user?.user_id);
      if (c) await db.deviceConnection.update({ where: { id: c.id }, data: { status: "error", lastError: event.message?.slice(0, 1000) ?? "Connection problem" } });
      return "connection_error";
    }
    case "daily": {
      const c = await findByTerraUser(event.user?.user_id);
      if (!c) return "daily: unknown user";
      const today = programToday();
      const earliest = addDays(today, -MAX_DAYS_BACK);
      // Each payload holds running totals; the latest one for a day replaces the earlier ones.
      const byDay = new Map<string, number>();
      for (const d of event.data ?? []) {
        const day = terraDay(d.metadata?.start_time);
        const steps = d.distance_data?.steps;
        if (!day || d.metadata?.upload_type === 4 || typeof steps !== "number" || !Number.isFinite(steps) || steps < 0) continue;
        byDay.set(day, Math.min(Math.round(steps), SYNC_STEPS_MAX));
      }
      let latest: { day: Date; steps: number } | null = null;
      for (const [iso, steps] of byDay) {
        const day = dateOnly(iso);
        if (day > today || day < earliest) continue;
        await recordSyncedSteps(c.userId, day, steps, deviceLabel(c.provider));
        if (!latest || day > latest.day) latest = { day, steps };
      }
      await db.deviceConnection.update({
        where: { id: c.id },
        data: { lastSyncedAt: new Date(), status: "connected", lastError: null, ...(latest ? { lastDay: latest.day, lastValue: latest.steps } : {}) },
      });
      return `daily: ${byDay.size} day(s)`;
    }
    default:
      return `ignored: ${event.type ?? "unknown"}`;
  }
}

// ── Demo mode ────────────────────────────────────────────────────────────────

/** Demo: connect a pretend device, as Terra's auth webhook would. */
export async function demoConnect(userId: string, code: string) {
  if (terraMode() !== "demo") throw new Error("Demo connections are only available without Terra credentials");
  if (!TERRA_PROVIDERS.some((p) => p.code === code)) throw new Error("Unknown provider");
  return handleTerraEvent({ type: "auth", reference_id: userId, user: { user_id: `demo-${randomUUID()}`, provider: code, reference_id: userId } });
}

/** Demo: a week of plausible daily step totals, sent through the same handler as real Terra data. */
export async function demoSendWeek(userId: string, connectionId: number) {
  if (terraMode() !== "demo") throw new Error("Demo data is only available without Terra credentials");
  const c = await db.deviceConnection.findFirst({ where: { id: connectionId, userId, provider: { startsWith: "terra:" } } });
  if (!c?.externalUserId) return;
  const today = programToday();
  const data: TerraDaily[] = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, -i).toISOString().slice(0, 10);
    const steps = 4_000 + Math.floor(Math.random() * 9_000);
    return { metadata: { start_time: `${day}T00:00:00-07:00`, upload_type: 1 }, distance_data: { steps } };
  });
  return handleTerraEvent({ type: "daily", user: { user_id: c.externalUserId, provider: c.provider.slice(6) }, data });
}
