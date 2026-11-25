import type { Metadata } from "next";
import { CheckCircle2, Clock, Gift, History, ListChecks, Lock, PackageCheck } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { cn, currentPlanYear } from "@/lib/utils";
import { PageBanner } from "@/components/brand/page-banner";
import { BANNERS } from "@/components/brand/photos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";
import { buttonClasses } from "@/components/ui/button";
import { ActionButton } from "@/components/content/action-button";
import { requestReward } from "./actions";

export const metadata: Metadata = { title: "Rewards" };

const CATEGORY_LABELS: Record<string, string> = {
  physical_activity: "Activity",
  nutrition: "Nutrition",
  daily_habit: "Habit",
  special_activity: "Event",
  content: "Learning",
  challenge: "Challenge",
  assessment: "Assessment",
  screening: "Screening",
  adjustment: "Adjustment",
};

const NOTICES: Record<string, { text: string; ok: boolean }> = {
  requested: { text: "Request sent. The wellness team will be in touch about your reward.", ok: true },
  locked: { text: "You don't have enough points for that reward yet.", ok: false },
};

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

export default async function RewardsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const { notice } = await searchParams;
  const [{ total }, tiers, rules, redemptions, ledger] = await Promise.all([
    getPointsSummary(user.id, planYear),
    db.rewardTier.findMany({ where: { planYear }, orderBy: { threshold: "asc" } }),
    db.pointsRule.findMany({ where: { planYear, isActive: true }, orderBy: [{ points: "desc" }] }),
    db.rewardRedemption.findMany({ where: { userId: user.id, tier: { planYear } }, orderBy: { requestedAt: "desc" } }),
    db.pointsLedger.findMany({ where: { userId: user.id, planYear }, orderBy: [{ occurredOn: "desc" }, { id: "desc" }], take: 40 }),
  ]);
  const latestFor = (tierId: number) => redemptions.find((r) => r.tierId === tierId && r.status !== "cancelled");
  const n = notice ? NOTICES[notice] : undefined;

  return (
    <>
      <PageBanner
        photo={BANNERS.rewards}
        eyebrow={`${planYear} rewards`}
        title={`${total.toLocaleString()} points earned`}
        description="You earn points for taking part, never for your health results."
      />
      {n && (
        <p role="status" className={cn("mb-4 rounded-xl px-4 py-2.5 text-sm font-medium", n.ok ? "bg-success-soft text-success" : "bg-accent-soft text-accent")}>
          {n.text}
        </p>
      )}

      {/* Tiers */}
      <section aria-labelledby="tiers-heading" className="space-y-4">
        <SectionTitle id="tiers-heading" icon={Gift} tone="orange" title="Your rewards" description="Unlock a tier, then request it here" />
        {tiers.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((t) => {
              const unlocked = total >= t.threshold;
              const r = latestFor(t.id);
              return (
                <Card key={t.id} className={cn("flex flex-col p-5", unlocked && !r && "ring-2 ring-peak-orange")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{t.threshold.toLocaleString()} points</span>
                    {r?.status === "fulfilled" ? (
                      <Badge tone="success">
                        <PackageCheck className="size-3" aria-hidden /> Received
                      </Badge>
                    ) : r?.status === "pending" ? (
                      <Badge tone="warning">
                        <Clock className="size-3" aria-hidden /> Requested
                      </Badge>
                    ) : unlocked ? (
                      <Badge tone="success">
                        <CheckCircle2 className="size-3" aria-hidden /> Unlocked
                      </Badge>
                    ) : (
                      <Badge>
                        <Lock className="size-3" aria-hidden /> Locked
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-ink">{t.label}</h3>
                  <p className="text-sm text-ink-muted">{t.reward}</p>
                  <div className="mt-auto pt-4">
                    {!unlocked && (
                      <>
                        <ProgressBar value={total / t.threshold} label={`Progress toward ${t.label}`} />
                        <p className="mt-1.5 text-xs text-ink-muted">{(t.threshold - total).toLocaleString()} points to go</p>
                      </>
                    )}
                    {unlocked && !r && (
                      <form action={requestReward.bind(null, t.id)}>
                        <ActionButton className={buttonClasses({}, "w-full")} pendingLabel="Sending…">
                          <Gift className="size-4" aria-hidden /> Request reward
                        </ActionButton>
                      </form>
                    )}
                    {r && (
                      <p className="text-xs text-ink-muted">
                        {r.status === "fulfilled" && r.fulfilledAt ? `Fulfilled ${fmtDay(r.fulfilledAt)}` : `Requested ${fmtDay(r.requestedAt)}. We'll be in touch.`}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState icon={Gift} title="Rewards for this year are coming soon" />
          </Card>
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* History */}
        <Card className="p-5">
          <SectionTitle icon={History} tone="blue" title="Points history" description={`Your latest ${planYear} points`} />
          {ledger.length ? (
            <ul className="mt-4 divide-y divide-border">
              {ledger.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-14 shrink-0 text-xs text-ink-muted">{fmtDay(l.occurredOn)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{l.description}</span>
                    <span className="text-xs text-ink-muted">{CATEGORY_LABELS[l.category] ?? l.category}</span>
                  </span>
                  <span className={cn("shrink-0 font-bold tabular-nums", l.points < 0 ? "text-accent" : "text-ink")}>
                    {l.points > 0 ? "+" : ""}
                    {l.points}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">No points yet this year. Check off a habit or log some activity to get started.</p>
          )}
        </Card>

        {/* Ways to earn */}
        <Card className="self-start p-5">
          <SectionTitle icon={ListChecks} tone="green" title="Ways to earn" description="Daily and yearly limits keep it fair for everyone" />
          <ul className="mt-4 divide-y divide-border">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="font-medium text-ink">{r.label}</span>
                <span className="shrink-0 text-ink-muted">
                  <span className="font-bold text-ink">{r.points}</span> pts
                  {r.maxPerDay ? ` · up to ${r.maxPerDay}/day` : ""}
                  {r.maxPerYear ? ` · up to ${r.maxPerYear}/yr` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
