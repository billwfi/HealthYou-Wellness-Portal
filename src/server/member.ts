import "server-only";
import { cache } from "react";
import { db } from "@/db";
import type { WellnessPath } from "@/lib/domain";

/** Everything personalization needs about a member, loaded once per request. */
export const getMemberContext = cache(async (userId: string) => {
  const [profile, interests, goals] = await Promise.all([
    db.memberProfile.findUnique({ where: { userId } }),
    db.userInterest.findMany({
      where: { userId },
      include: { tag: true },
      orderBy: [{ tag: { path: "asc" } }, { tag: { sortOrder: "asc" } }],
    }),
    db.pathGoal.findMany({ where: { userId, status: "active" } }),
  ]);
  return {
    profile,
    onboarded: Boolean(profile?.onboardedAt),
    interests: interests.map((i) => i.tag),
    goals: Object.fromEntries(goals.map((g) => [g.path, g.goal])) as Partial<Record<WellnessPath, string>>,
  };
});
