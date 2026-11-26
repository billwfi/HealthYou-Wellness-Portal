import { handleTerraEvent, terraMode, verifyTerraSignature, type TerraEvent } from "@/server/terra";

/**
 * Terra delivers connection events and daily data here. Every request must carry
 * a valid X-Terra-Signature; Terra retries anything that isn't a 2xx.
 */
export async function POST(request: Request) {
  if (terraMode() !== "live") return reply(404, "Terra isn't configured.");
  const raw = await request.text();
  if (raw.length > 5_000_000) return reply(413, "Payload too large.");
  if (!verifyTerraSignature(raw, request.headers.get("x-terra-signature"))) return reply(401, "Bad signature.");

  let event: TerraEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return reply(400, "Invalid JSON.");
  }
  try {
    const note = await handleTerraEvent(event);
    console.info(`terra webhook ${note}`);
    return reply(200, note);
  } catch (e) {
    console.error("terra webhook failed", e);
    return reply(500, "Processing failed.");
  }
}

function reply(status: number, message: string) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}
