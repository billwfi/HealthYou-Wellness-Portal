import "server-only";
import { db } from "@/db";

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
