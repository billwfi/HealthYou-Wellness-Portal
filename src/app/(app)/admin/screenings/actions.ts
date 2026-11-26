"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { parseScreeningCsv, SCREENING_SOURCES, type ScreeningSource } from "@/lib/biometrics";
import { audit } from "@/server/audit";
import { awardScreeningPoints, saveScreening } from "@/server/screenings";
import { notify } from "@/server/push";

export type ImportState = {
  done: boolean;
  error: string | null;
  created: number;
  updated: number;
  pointsAwarded: number;
  problems: { line: number; message: string }[];
};

// Server actions accept up to 1 MB by default; ~900 KB is about 15,000 rows.
const MAX_BYTES = 900_000;

/** Import a CSV of screening results. Rows for unknown emails are reported, not created. */
export async function importScreenings(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const admin = await requireAdmin();
  const empty: ImportState = { done: false, error: null, created: 0, updated: 0, pointsAwarded: 0, problems: [] };

  const file = formData.get("file");
  let text = String(formData.get("csv") ?? "");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return { ...empty, error: "That file is over 900 KB. Split it into smaller files." };
    text = await file.text();
  }
  if (!text.trim()) return { ...empty, error: "Choose a CSV file or paste the rows." };
  const source = SCREENING_SOURCES.includes(formData.get("source") as ScreeningSource) ? (formData.get("source") as ScreeningSource) : "lab";
  if (source === "self_reported") return { ...empty, error: "Imports are verified results; choose onsite, lab or physician form." };

  const { rows, errors } = parseScreeningCsv(text.replace(/^\uFEFF/, ""), source);
  const problems = [...errors];
  const users = await db.user.findMany({ where: { email: { in: [...new Set(rows.map((r) => r.email))] } }, select: { id: true, email: true } });
  const idFor = new Map(users.map((u) => [u.email.toLowerCase(), u.id]));

  let created = 0;
  let updated = 0;
  let pointsAwarded = 0;
  for (const r of rows) {
    const userId = idFor.get(r.email);
    if (!userId) {
      problems.push({ line: r.line, message: `No member with email ${r.email}.` });
      continue;
    }
    const result = await saveScreening({ userId, screenedOn: r.screenedOn, source: r.source === "self_reported" ? source : r.source, results: r.results, verifiedBy: admin.name });
    if (result.created) created++;
    else updated++;
    pointsAwarded += result.points;
  }

  await audit(admin.id, "screening.import", "biometric_screening", null, { created, updated, problems: problems.length });
  revalidatePath("/", "layout");
  return { done: true, error: null, created, updated, pointsAwarded, problems: problems.sort((a, b) => a.line - b.line) };
}

/** Confirm a member's self-reported screening; this is what earns its points. */
export async function verifyScreening(id: number) {
  const admin = await requireAdmin();
  const s = await db.biometricScreening.findUnique({ where: { id: Number(id) } });
  if (!s || s.verifiedAt) return;
  await db.biometricScreening.update({ where: { id: s.id }, data: { verifiedBy: admin.name, verifiedAt: new Date() } });
  await awardScreeningPoints(s.userId, s.id, s.screenedOn, s.source);
  await audit(admin.id, "screening.verify", "biometric_screening", s.id, { userId: s.userId });
  await notify([s.userId], { title: "Screening verified", body: "Your screening results are confirmed and your points are in.", url: "/progress/health", tag: "screening" }, "account");
  revalidatePath("/", "layout");
}

/** Remove a self-reported screening that can't be verified. */
export async function rejectScreening(id: number) {
  const admin = await requireAdmin();
  const s = await db.biometricScreening.findUnique({ where: { id: Number(id) } });
  if (!s || s.verifiedAt) return;
  await db.biometricScreening.delete({ where: { id: s.id } });
  await audit(admin.id, "screening.reject", "biometric_screening", s.id, { userId: s.userId });
  revalidatePath("/", "layout");
}
