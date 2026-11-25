import "server-only";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";

export async function getPointsSummary(userId: string, planYear: number) {
  const { _sum } = await db.pointsLedger.aggregate({
    where: { userId, planYear },
    _sum: { points: true },
  });
  const total = _sum.points ?? 0;

  const nextTier = await db.rewardTier.findFirst({
    where: { planYear, threshold: { gt: total } },
    orderBy: { threshold: "asc" },
  });

  return { total, nextTier };
}

type Award = {
  userId: string;
  /** PointsRule slug for the plan year of `on`. */
  ruleSlug: string;
  /** With sourceId, identifies the thing being rewarded; awarding twice is a no-op. */
  sourceType: string;
  sourceId: string;
  description: string;
  /** Program calendar day (a @db.Date value). */
  on: Date;
  /** Overrides the rule's amount (e.g. per-item content points); caps still apply. */
  points?: number;
};

/**
 * Award participation points under a rule, trimmed to its daily and yearly caps.
 * Returns the points actually awarded (0 if capped, inactive, or already awarded).
 */
export async function awardPoints({ userId, ruleSlug, sourceType, sourceId, description, on, points: amount }: Award) {
  const planYear = on.getUTCFullYear();
  const rule = await db.pointsRule.findUnique({ where: { planYear_slug: { planYear, slug: ruleSlug } } });
  if (!rule?.isActive) return 0;

  let points = amount ?? rule.points;
  if (rule.maxPerDay != null) {
    const { _sum } = await db.pointsLedger.aggregate({
      where: { userId, ruleId: rule.id, occurredOn: on },
      _sum: { points: true },
    });
    points = Math.min(points, rule.maxPerDay - (_sum.points ?? 0));
  }
  if (rule.maxPerYear != null) {
    const { _sum } = await db.pointsLedger.aggregate({
      where: { userId, ruleId: rule.id, planYear },
      _sum: { points: true },
    });
    points = Math.min(points, rule.maxPerYear - (_sum.points ?? 0));
  }
  if (points <= 0) return 0;

  try {
    await db.pointsLedger.create({
      data: { userId, planYear, category: rule.category, points, ruleId: rule.id, sourceType, sourceId, description, occurredOn: on },
    });
    return points;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return 0; // already awarded
    throw e;
  }
}
