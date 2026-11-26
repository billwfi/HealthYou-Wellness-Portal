"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { MEMBER_TYPES, WELLNESS_PATHS } from "@/lib/domain";
import { GOAL_MAX_LENGTH, MAX_HABITS } from "@/lib/goals";

export type OnboardingState = { error: string | null };

const ids = z.array(z.coerce.number().int().positive());

const Onboarding = z.object({
  memberType: z.enum(MEMBER_TYPES, { error: "Choose how you're connected to the City." }),
  department: z.string().trim().max(200).optional(),
  tagIds: ids.min(1, "Pick at least one interest so we can personalize your feed."),
  habitIds: ids.max(MAX_HABITS, `Pick up to ${MAX_HABITS} habits.`),
  goals: z.object(
    Object.fromEntries(WELLNESS_PATHS.map((p) => [p, z.string().trim().max(GOAL_MAX_LENGTH, "Keep goals under 200 characters.")])) as Record<
      (typeof WELLNESS_PATHS)[number],
      z.ZodString
    >,
  ),
});

export async function saveOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = Onboarding.safeParse({
    memberType: formData.get("memberType"),
    department: formData.get("department") ?? undefined,
    tagIds: formData.getAll("tag"),
    habitIds: formData.getAll("habit"),
    goals: Object.fromEntries(WELLNESS_PATHS.map((p) => [p, formData.get(`goal_${p}`) ?? ""])),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  const { memberType, department, goals } = parsed.data;

  // Only keep ids that exist (form values are user-controlled).
  const [tags, habits, existing] = await Promise.all([
    db.tag.findMany({ where: { id: { in: parsed.data.tagIds } }, select: { id: true } }),
    db.habit.findMany({ where: { id: { in: parsed.data.habitIds }, isActive: true }, select: { id: true } }),
    db.memberProfile.findUnique({ where: { userId: user.id }, select: { onboardedAt: true } }),
  ]);
  if (tags.length === 0) return { error: "Pick at least one interest so we can personalize your feed." };
  const tagIds = tags.map((t) => t.id);
  const habitIds = habits.map((h) => h.id);
  const editing = Boolean(existing?.onboardedAt);

  await db.$transaction(async (tx) => {
    await tx.memberProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, memberType, department: department || null, onboardedAt: new Date() },
      update: { memberType, department: department || null, onboardedAt: existing?.onboardedAt ?? new Date() },
    });

    await tx.userInterest.deleteMany({ where: { userId: user.id } });
    await tx.userInterest.createMany({ data: tagIds.map((tagId) => ({ userId: user.id, tagId })) });

    for (const path of WELLNESS_PATHS) {
      const goal = goals[path];
      if (goal) {
        await tx.pathGoal.upsert({
          where: { userId_path: { userId: user.id, path } },
          create: { userId: user.id, path, goal },
          update: { goal, status: "active" },
        });
      } else {
        await tx.pathGoal.deleteMany({ where: { userId: user.id, path } });
      }
    }

    // Habits keep their history (logs), so deactivate rather than delete.
    await tx.userHabit.updateMany({ where: { userId: user.id, habitId: { notIn: habitIds } }, data: { active: false } });
    for (const habitId of habitIds) {
      await tx.userHabit.upsert({
        where: { userId_habitId: { userId: user.id, habitId } },
        create: { userId: user.id, habitId },
        update: { active: true },
      });
    }
  });

  revalidatePath("/", "layout");
  redirect(editing ? "/profile" : "/");
}
