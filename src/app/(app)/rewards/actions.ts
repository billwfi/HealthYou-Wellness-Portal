"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { currentPlanYear } from "@/lib/utils";
import { getPointsSummary } from "@/server/points";

/** Ask for an unlocked reward. One open or fulfilled request per tier per year. */
export async function requestReward(tierId: number) {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const tier = await db.rewardTier.findFirst({ where: { id: Number(tierId), planYear } });
  if (!tier) redirect("/rewards");

  const [{ total }, existing] = await Promise.all([
    getPointsSummary(user.id, planYear),
    db.rewardRedemption.findFirst({ where: { userId: user.id, tierId: tier.id, status: { in: ["pending", "fulfilled"] } } }),
  ]);
  if (total < tier.threshold) redirect("/rewards?notice=locked");
  if (!existing) {
    await db.rewardRedemption.create({
      data: { userId: user.id, tierId: tier.id, status: "pending", details: JSON.stringify({ pointsAtRequest: total, planYear }) },
    });
  }
  revalidatePath("/rewards");
  redirect("/rewards?notice=requested");
}
