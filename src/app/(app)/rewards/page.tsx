import type { Metadata } from "next";
import { Check, Gift } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { currentPlanYear } from "@/lib/utils";
import { PageBanner } from "@/components/brand/page-banner";
import { BANNERS } from "@/components/brand/photos";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Rewards" };

export default async function RewardsPage() {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const [{ total }, tiers, rules] = await Promise.all([
    getPointsSummary(user.id, planYear),
    db.rewardTier.findMany({ where: { planYear }, orderBy: { threshold: "asc" } }),
    db.pointsRule.findMany({ where: { planYear, isActive: true }, orderBy: [{ category: "asc" }, { label: "asc" }] }),
  ]);

  return (
    <>
      <PageBanner photo={BANNERS.rewards}
        eyebrow="Rewards"
        title={`${total.toLocaleString()} points earned in ${planYear}`}
        description="Rewards are based on participation — you earn points for taking part, not for your health results."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Reward tiers" />
          <CardBody>
            {tiers.length === 0 ? (
              <EmptyState icon={Gift} title="Reward tiers haven't been published yet" />
            ) : (
              <ol className="space-y-3">
                {tiers.map((t) => {
                  const done = total >= t.threshold;
                  return (
                    <li key={t.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                          done ? "bg-success text-white" : "bg-surface-muted text-ink-muted",
                        )}
                      >
                        {done ? <Check className="size-4" aria-label="Unlocked" /> : t.sortOrder + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{t.label}</p>
                        <p className="text-sm text-ink-muted">{t.reward}</p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-ink-muted">{t.threshold.toLocaleString()} pts</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Ways to earn" description="Daily caps keep it fair for everyone." />
          <CardBody>
            <ul className="divide-y divide-border">
              {rules.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="shrink-0 text-ink-muted">
                    <span className="font-bold text-ink">{r.points}</span> pts{r.maxPerDay ? ` · max ${r.maxPerDay}/day` : ""}
                    {r.maxPerYear ? ` · max ${r.maxPerYear}/yr` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
