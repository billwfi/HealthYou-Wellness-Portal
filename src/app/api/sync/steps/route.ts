import { syncSteps } from "@/server/step-sync";

/**
 * Called by the member's Apple Shortcut:
 *   POST /api/sync/steps
 *   Authorization: Bearer ryp_…
 *   { "steps": 8432, "date": "2026-11-26" }   (date optional, defaults to today in Denver)
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.replace(/^Bearer\s+/i, "").trim();
  if (!key) return reply(401, { ok: false, message: "Missing sync key." });

  const text = await request.text();
  if (text.length > 2_000) return reply(413, { ok: false, message: "Too much data sent." });
  let body: Record<string, unknown> = {};
  try {
    const parsed = text ? JSON.parse(text) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed;
  } catch {
    return reply(400, { ok: false, message: "The shortcut should send JSON. Set Request Body to JSON." });
  }

  try {
    const result = await syncSteps(key, { steps: body.steps, date: body.date });
    return reply(result.status, result.body);
  } catch (e) {
    console.error("step sync failed", e);
    return reply(500, { ok: false, message: "Something went wrong. Try again later." });
  }
}

function reply(status: number, body: { ok: boolean; message: string }) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
