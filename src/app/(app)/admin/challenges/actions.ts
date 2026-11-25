"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/session";
import { CHALLENGE_METRICS, CHALLENGE_TYPES, TEAM_MODES } from "@/lib/domain";
import { dateOnly, programToday } from "@/lib/dates";
import { SLUG_PATTERN } from "@/lib/slug";
import { CHALLENGE_TYPE_META, challengePhase, isDayScored, METRIC_META } from "@/lib/challenges";
import { audit } from "@/server/audit";
import { finalizeChallenge, recomputeProgress } from "@/server/challenges";

export type ChallengeFormState = { error: string | null; fieldErrors: Partial<Record<string, string>> };

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
  .transform(dateOnly);
const optionalAmount = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : Number(s)))
  .pipe(z.number({ error: "Enter a number." }).positive("Must be above zero.").max(10_000_000, "That's too large.").nullable());
const optionalCount = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : Number(s)))
  .pipe(z.number().int("Use a whole number.").min(2, "At least 2.").max(500, "At most 500.").nullable());

const ChallengeInput = z
  .object({
    name: z.string().trim().min(1, "Add a name.").max(200, "Keep the name under 200 characters."),
    slug: z.string().trim().toLowerCase().min(1, "Add a web address.").max(150).regex(SLUG_PATTERN, "Use lowercase letters, numbers and dashes."),
    description: z
      .string()
      .trim()
      .max(1000, "Keep the description under 1,000 characters.")
      .transform((s) => s || null),
    type: z.enum(CHALLENGE_TYPES, { error: "Choose a type." }),
    metric: z.enum(CHALLENGE_METRICS, { error: "Choose what counts." }),
    goalValue: optionalAmount,
    dailyGoal: optionalAmount,
    dailyCap: optionalAmount,
    startDate: day,
    endDate: day,
    teamMode: z.enum(TEAM_MODES, { error: "Choose who can join." }),
    maxTeamSize: optionalCount,
    pointsOnCompletion: z
      .string()
      .trim()
      .transform((s) => (s === "" ? 0 : Number(s)))
      .pipe(z.number().int("Use a whole number.").min(0, "Can't be negative.").max(5000, "At most 5,000.")),
    published: z.boolean(),
    templateId: z
      .string()
      .transform((s) => (s ? Number(s) : null))
      .pipe(z.number().int().positive().nullable()),
  })
  .refine((v) => v.endDate >= v.startDate, { message: "The end date must be on or after the start.", path: ["endDate"] })
  .refine((v) => CHALLENGE_TYPE_META[v.type].goal !== "required" || v.goalValue != null, { message: "This type needs a goal.", path: ["goalValue"] })
  .refine((v) => !isDayScored(v.type) || v.goalValue == null || Number.isInteger(v.goalValue), { message: "Use a whole number of days.", path: ["goalValue"] })
  .refine((v) => v.dailyCap == null || v.dailyGoal == null || v.dailyCap >= v.dailyGoal, { message: "The daily cap can't be below the daily goal.", path: ["dailyCap"] });

/** Recalculate everyone's progress after a change to what counts. */
async function recomputeAll(challengeId: number, start: Date, end: Date) {
  const today = programToday();
  if (start > today) return;
  const until = end < today ? end : today;
  const enrolled = await db.challengeEnrollment.findMany({ where: { challengeId }, select: { userId: true } });
  // Clear rows outside a shortened window first; recompute rewrites the rest.
  await db.challengeProgressDaily.deleteMany({ where: { challengeId, OR: [{ day: { lt: start } }, { day: { gt: end } }] } });
  for (const e of enrolled) await recomputeProgress(e.userId, start, until);
}

export async function saveChallenge(id: number | null, _prev: ChallengeFormState, formData: FormData): Promise<ChallengeFormState> {
  const admin = await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "");
  const parsed = ChallengeInput.safeParse({
    ...Object.fromEntries(
      ["name", "slug", "description", "type", "metric", "goalValue", "dailyGoal", "dailyCap", "startDate", "endDate", "teamMode", "maxTeamSize", "pointsOnCompletion", "templateId"].map((k) => [k, text(k)]),
    ),
    published: formData.get("status") === "published",
  });
  if (!parsed.success) {
    const fieldErrors: ChallengeFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const { published, ...v } = parsed.data;
  const existing = id == null ? null : await db.challenge.findUnique({ where: { id } });
  if (id != null && !existing) return { error: "This challenge no longer exists.", fieldErrors: {} };
  if (existing && (existing.status === "completed" || existing.status === "archived")) {
    return { error: "Finished or archived challenges can't be edited.", fieldErrors: {} };
  }

  const data = {
    ...v,
    unit: METRIC_META[v.metric].unit,
    // Day-scored types need a per-day threshold; default to 1.
    dailyGoal: isDayScored(v.type) ? (v.dailyGoal ?? 1) : null,
    maxTeamSize: v.teamMode === "individual" ? null : v.maxTeamSize,
    status: published ? "scheduled" : "draft",
  };

  let saved;
  try {
    saved = await db.$transaction(async (tx) => {
      const row = existing
        ? await tx.challenge.update({ where: { id: existing.id }, data })
        : await tx.challenge.create({ data: { ...data, createdBy: admin.id } });
      await audit(admin.id, existing ? "challenge.update" : "challenge.create", "challenge", row.id, { name: row.name, status: row.status }, tx);
      return row;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Please fix the highlighted fields.", fieldErrors: { slug: "Another challenge already uses this web address." } };
    }
    throw e;
  }

  const scoringChanged =
    existing &&
    (existing.metric !== saved.metric ||
      existing.startDate.getTime() !== saved.startDate.getTime() ||
      existing.endDate.getTime() !== saved.endDate.getTime() ||
      String(existing.dailyCap ?? "") !== String(saved.dailyCap ?? ""));
  if (scoringChanged) await recomputeAll(saved.id, saved.startDate, saved.endDate);

  revalidatePath("/", "layout");
  redirect(`/admin/challenges?saved=${saved.id}`);
}

export async function finalizeChallengeAction(id: number) {
  const admin = await requireAdmin();
  const c = await db.challenge.findUnique({ where: { id } });
  if (!c || challengePhase(c, programToday()) !== "ended") redirect("/admin/challenges");
  await finalizeChallenge(c.id);
  await audit(admin.id, "challenge.finalize", "challenge", c.id, { name: c.name });
  revalidatePath("/", "layout");
  redirect(`/admin/challenges?finalized=${c.id}`);
}

/** Delete if nobody joined; otherwise archive so history and earned points stay intact. */
export async function removeChallenge(id: number) {
  const admin = await requireAdmin();
  const c = await db.challenge.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } } } });
  if (!c) redirect("/admin/challenges");
  if (c._count.enrollments === 0) {
    await db.$transaction(async (tx) => {
      await tx.team.deleteMany({ where: { challengeId: c.id } });
      await tx.challenge.delete({ where: { id: c.id } });
      await audit(admin.id, "challenge.delete", "challenge", c.id, { name: c.name }, tx);
    });
  } else {
    await db.challenge.update({ where: { id: c.id }, data: { status: "archived" } });
    await audit(admin.id, "challenge.archive", "challenge", c.id, { name: c.name });
  }
  revalidatePath("/", "layout");
  redirect("/admin/challenges?removed=1");
}
