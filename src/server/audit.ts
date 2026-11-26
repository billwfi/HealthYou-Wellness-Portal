import "server-only";
import { db } from "@/db";

type Client = Pick<typeof db, "auditLog">;

/** Record an admin change. Pass a transaction client to log atomically with the change. */
export async function audit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string | number | null,
  metadata?: Record<string, unknown>,
  client: Client = db,
) {
  await client.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId: entityId == null ? null : String(entityId),
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
