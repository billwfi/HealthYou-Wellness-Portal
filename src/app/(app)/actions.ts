"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { programToday, programDay } from "@/lib/dates";
import { awardPoints } from "@/server/points";
import { recomputeProgress } from "@/server/challenges";

const Id = z.coerce.number().int().positive();

async function contentFor(contentId: unknown) {
  const id = Id.parse(contentId);
  const item = await db.contentItem.findFirst({ where: { id, publishedAt: { not: null } }, select: { id: true, title: true, points: true } });
  if (!item) throw new Error("Content not found");
  return item;
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function toggleSaveContent(contentId: number) {
  const user = await requireUser();
  const item = await contentFor(contentId);
  const key = { userId_contentId: { userId: user.id, contentId: item.id } };
  const existing = await db.contentInteraction.findUnique({ where: key });
  const savedAt = existing?.savedAt ? null : new Date();
  await db.contentInteraction.upsert({
    where: key,
    create: { userId: user.id, contentId: item.id, savedAt, viewedAt: new Date() },
    update: { savedAt },
  });
  refresh();
}

export async function dismissContent(contentId: number) {
  const user = await requireUser();
  const item = await contentFor(contentId);
  const now = new Date();
  await db.contentInteraction.upsert({
    where: { userId_contentId: { userId: user.id, contentId: item.id } },
    create: { userId: user.id, contentId: item.id, dismissedAt: now },
    update: { dismissedAt: now },
  });
  refresh();
}

export async function completeContent(contentId: number) {
  const user = await requireUser();
  const item = await contentFor(contentId);
  const now = new Date();
  await db.contentInteraction.upsert({
    where: { userId_contentId: { userId: user.id, contentId: item.id } },
    create: { userId: user.id, contentId: item.id, viewedAt: now, completedAt: now },
    update: { completedAt: now },
  });
  // Each item sets its own points (0 = none); the content rule's daily cap still applies.
  if (item.points > 0) await awardPoints({
    userId: user.id,
    ruleSlug: "content",
    sourceType: "content",
    sourceId: String(item.id),
    description: `Completed: ${item.title}`.slice(0, 500),
    on: programToday(now),
    points: item.points,
  });
  refresh();
}

/**
 * Check a habit off for today, or undo today's check-in.
 * Undo removes the day's points row too: a same-day correction by the member, so
 * re-checking can't earn twice (the ledger key is habit + day).
 */
export async function toggleHabitToday(habitId: number) {
  const user = await requireUser();
  const id = Id.parse(habitId);
  const enrolled = await db.userHabit.findFirst({
    where: { userId: user.id, habitId: id, active: true, habit: { isActive: true } },
    include: { habit: { select: { title: true } } },
  });
  if (!enrolled) throw new Error("Habit not found");

  const today = programToday();
  const sourceId = `${id}:${programDay()}`;
  const key = { userId_habitId_logDate: { userId: user.id, habitId: id, logDate: today } };

  if (await db.habitLog.findUnique({ where: key })) {
    await db.$transaction([
      db.habitLog.delete({ where: key }),
      db.pointsLedger.deleteMany({ where: { userId: user.id, sourceType: "habit", sourceId } }),
    ]);
  } else {
    try {
      await db.habitLog.create({ data: { userId: user.id, habitId: id, logDate: today } });
    } catch (e) {
      // A double-click already logged today: nothing more to do.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return refresh();
      throw e;
    }
    await awardPoints({
      userId: user.id,
      ruleSlug: "daily-habit",
      sourceType: "habit",
      sourceId,
      description: enrolled.habit.title,
      on: today,
    });
  }
  // Habit check-ins count toward habit-based challenges.
  await recomputeProgress(user.id, today, today);
  refresh();
}
