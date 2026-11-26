/** Terra device connections: provider catalog and pure helpers (no server-only imports). */

export type TerraProvider = { code: string; label: string; hint: string };

/** Offered in the connect widget, in this order. */
export const TERRA_PROVIDERS: TerraProvider[] = [
  { code: "APPLE", label: "Apple Health", hint: "iPhone and Apple Watch, through the free Terra Grip app" },
  { code: "HEALTH_CONNECT", label: "Health Connect", hint: "Android phones, through the free Terra Grip app" },
  { code: "GARMIN", label: "Garmin", hint: "Sign in with your Garmin Connect account" },
  { code: "GOOGLE_HEALTH", label: "Fitbit & Pixel Watch", hint: "Sign in with your Google account" },
  { code: "OURA", label: "Oura", hint: "Sign in with your Oura account" },
  { code: "POLAR", label: "Polar", hint: "Sign in with your Polar Flow account" },
  { code: "WITHINGS", label: "Withings", hint: "Sign in with your Withings account" },
];

const BY_CODE = new Map(TERRA_PROVIDERS.map((p) => [p.code, p]));

/** DeviceConnection.provider value for a Terra provider code. */
export const terraProviderKey = (code: string) => `terra:${code.toUpperCase()}`;

/** Friendly name for a DeviceConnection.provider value (or a bare Terra code). */
export function deviceLabel(provider: string) {
  if (provider === "apple_health") return "Apple Health (Shortcut)";
  const code = provider.replace(/^terra:/, "").toUpperCase();
  return BY_CODE.get(code)?.label ?? code.charAt(0) + code.slice(1).toLowerCase().replace(/_/g, " ");
}

/** Parse `t=<unix>,v1=<hex>` from X-Terra-Signature. Only v1 is trusted. */
export function parseTerraSignature(header: string | null) {
  if (!header) return null;
  let t: number | null = null;
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "t" && /^\d+$/.test(v ?? "")) t = Number(v);
    if (k === "v1" && /^[0-9a-f]+$/i.test(v ?? "")) v1.push(v.toLowerCase());
  }
  return t != null && v1.length ? { t, v1 } : null;
}

/**
 * The calendar day a Terra daily record covers: the date part of start_time,
 * taken as sent. (Terra's docs don't state the zone; converting to UTC could
 * shift an evening's steps onto the next day.)
 */
export function terraDay(startTime: unknown): string | null {
  const s = typeof startTime === "string" ? startTime.slice(0, 10) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
