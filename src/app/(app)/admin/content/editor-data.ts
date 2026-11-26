import "server-only";
import { db } from "@/db";
import type { WellnessPath } from "@/lib/domain";

export async function getEditorTags() {
  const tags = await db.tag.findMany({ orderBy: [{ path: "asc" }, { sortOrder: "asc" }], select: { id: true, label: true, path: true } });
  return tags.map((t) => ({ ...t, path: t.path as WellnessPath }));
}

/** @db.Date value → "YYYY-MM-DD" for <input type="date">. */
export function dayInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}
