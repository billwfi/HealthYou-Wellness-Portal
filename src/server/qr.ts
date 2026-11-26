import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

/** The site's public origin, from BETTER_AUTH_URL or the request. */
export async function siteOrigin() {
  const base = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");
  if (base) return base;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

/** A QR code for `text` as an SVG data URI (navy on white so phones read it in dark mode too). */
export async function qrDataUri(text: string) {
  const svg = await QRCode.toString(text, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#0b1f4d", light: "#ffffff" } });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
