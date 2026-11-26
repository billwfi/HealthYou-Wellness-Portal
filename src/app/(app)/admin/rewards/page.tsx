import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Trash2, X } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { cn, currentPlanYear } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { control } from "@/components/admin/form-fields";
import { ActionButton } from "@/components/content/action-button";
import { adjustPoints, deleteTier, saveRule, saveTier, setRedemptionStatus } from "./actions";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Admin: Points & rewards" };

const NOTICES: Record<string, { text: string; ok: boolean }> = {
  fulfilled: { text: "Marked as fulfilled.", ok: true },
  cancelled: { text: "Request cancelled. The member can request it again.", ok: true },
  stale: { text: "That item changed in the meantime. Refresh and try again.", ok: false },
  "tier-saved": { text: "Tier saved.", ok: true },
  "tier-deleted": { text: "Tier deleted.", ok: true },
  "tier-invalid": { text: "A tier needs a name, a reward and a points threshold of at least 1.", ok: false },
  "tier-in-use": { text: "Members have requested that tier, so it can't be deleted. Edit it instead.", ok: false },
  "rule-saved": { text: "Rule saved. It applies to points earned from now on.", ok: true },
  "rule-invalid": { text: "Points and limits must be whole numbers of 0 or more (points at most 5,000).", ok: false },
  adjusted: { text: "Points adjusted.", ok: true },
  "adjust-invalid": { text: "Enter a whole number of points (not 0, at most ±5,000) and a reason.", ok: false },
  "adjust-no-member": { text: "No member has that email.", ok: false },
};

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Denver" }).format(d);
const input = cn(control, "h-9 text-sm");

export default async function AdminRewardsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const { notice } = await searchParams;
  const planYear = currentPlanYear();
  const [pending, handled, tiers, rules, adjustments] = await Promise.all([
    db.rewardRedemption.findMany({
      where: { status: "pending" },
      include: { user: { select: { name: true, email: true } }, tier: true },
      orderBy: { requestedAt: "asc" },
    }),
    db.rewardRedemption.findMany({
      where: { status: { not: "pending" } },
      include: { user: { select: { name: true } }, tier: { select: { label: true } } },
      orderBy: { requestedAt: "desc" },
      take: 15,
    }),
    db.rewardTier.findMany({ where: { planYear }, orderBy: { threshold: "asc" }, include: { _count: { select: { redemptions: true } } } }),
    db.pointsRule.findMany({ where: { planYear }, orderBy: { label: "asc" } }),
    db.pointsLedger.findMany({
      where: { category: "adjustment", planYear },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const n = notice ? NOTICES[notice] : undefined;

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader eyebrow="Admin" title={`Points & rewards ${planYear}`} description="Fulfill reward requests, set tiers and earning rules, and adjust a member's points." />
      {n && (
        <Notice className={cn("mb-4 rounded-xl px-4 py-2.5 text-sm font-medium", n.ok ? "bg-success-soft text-success" : "bg-accent-soft text-accent")}>
          {n.text}
        </Notice>
      )}

      {/* Requests */}
      <Card id="requests" className="scroll-mt-24">
        <CardHeader title="Reward requests" description={`${pending.length} waiting`} />
        {pending.length ? (
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-48 flex-1 text-sm">
                  <p className="font-semibold text-ink">
                    {r.user.name} · {r.tier?.label ?? "Tier removed"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {r.user.email} · {r.tier?.reward} · requested {fmtDay(r.requestedAt)}
                  </p>
                </div>
                <form className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`note-${r.id}`}>
                    Note for {r.user.name}
                  </label>
                  <input id={`note-${r.id}`} name="note" placeholder="Note (optional)" maxLength={500} className={cn(input, "w-48")} />
                  <ActionButton formAction={setRedemptionStatus.bind(null, r.id, "fulfilled")} className={buttonClasses({ size: "sm" })} pendingLabel="…">
                    <Check className="size-4" aria-hidden /> Fulfilled<span className="sr-only">: {r.user.name}, {r.tier?.label}</span>
                  </ActionButton>
                  <ActionButton formAction={setRedemptionStatus.bind(null, r.id, "cancelled")} className={buttonClasses({ size: "sm", variant: "ghost" })} pendingLabel="…">
                    <X className="size-4" aria-hidden /> Cancel<span className="sr-only"> request from {r.user.name}</span>
                  </ActionButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <CardBody className="text-sm text-ink-muted">No requests waiting.</CardBody>
        )}
        {handled.length > 0 && (
          <details className="border-t border-border px-5 py-3 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-muted hover:text-ink">Recently handled</summary>
            <ul className="mt-2 space-y-1 text-ink-muted">
              {handled.map((r) => (
                <li key={r.id}>
                  {r.user.name} · {r.tier?.label ?? "Tier removed"} ·{" "}
                  <Badge tone={r.status === "fulfilled" ? "success" : "neutral"}>{r.status}</Badge>
                  {r.fulfilledAt && ` ${fmtDay(r.fulfilledAt)}`}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Tiers */}
        <Card id="tiers" className="scroll-mt-24">
          <CardHeader title="Reward tiers" description="Members unlock a tier when their yearly points reach its threshold" />
          <CardBody className="space-y-3 overflow-x-auto">
            {tiers.map((t) => (
              <form key={t.id} action={saveTier.bind(null, t.id)} className="grid min-w-lg grid-cols-[1fr_1.4fr_90px_auto] items-center gap-2">
                <input name="label" defaultValue={t.label} aria-label={`${t.label}: tier name`} required maxLength={100} className={input} />
                <input name="reward" defaultValue={t.reward} aria-label={`${t.label}: reward`} required maxLength={300} className={input} />
                <input name="threshold" defaultValue={t.threshold} aria-label={`${t.label}: points needed`} type="number" min={1} required className={input} />
                <span className="flex gap-1">
                  <ActionButton className={buttonClasses({ size: "sm", variant: "secondary" })} pendingLabel="…">
                    Save<span className="sr-only"> {t.label}</span>
                  </ActionButton>
                  {t._count.redemptions === 0 && (
                    <ActionButton
                      formAction={deleteTier.bind(null, t.id)}
                      formNoValidate
                      className="grid size-8 place-items-center rounded-full text-ink-subtle hover:bg-accent-soft hover:text-accent"
                      aria-label={`Delete tier ${t.label}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </ActionButton>
                  )}
                </span>
              </form>
            ))}
            <form action={saveTier.bind(null, null)} className="grid min-w-lg grid-cols-[1fr_1.4fr_90px_auto] items-center gap-2 border-t border-border pt-3">
              <input name="label" placeholder="New tier" aria-label="New tier name" required maxLength={100} className={input} />
              <input name="reward" placeholder="Reward" aria-label="New tier reward" required maxLength={300} className={input} />
              <input name="threshold" placeholder="Points" aria-label="Points needed for the new tier" type="number" min={1} required className={input} />
              <ActionButton className={buttonClasses({ size: "sm" })} pendingLabel="…">
                <Plus className="size-4" aria-hidden /> Add
              </ActionButton>
            </form>
          </CardBody>
        </Card>

        {/* Rules */}
        <Card id="rules" className="scroll-mt-24">
          <CardHeader title="Earning rules" description="Points per action with daily and yearly limits. Changes apply from now on." />
          <CardBody className="overflow-x-auto">
            <div className="mb-1 grid min-w-md grid-cols-[1fr_64px_64px_64px_auto_auto] gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              <span>Rule</span>
              <span>Points</span>
              <span>Per day</span>
              <span>Per year</span>
              <span>On</span>
              <span />
            </div>
            <div className="space-y-2">
              {rules.map((r) => (
                <form key={r.id} action={saveRule.bind(null, r.id)} className="grid min-w-md grid-cols-[1fr_64px_64px_64px_auto_auto] items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink" title={r.label}>
                    {r.label}
                  </span>
                  <input name="points" defaultValue={r.points} type="number" min={0} required aria-label={`${r.label}: points`} className={input} />
                  <input name="maxPerDay" defaultValue={r.maxPerDay ?? ""} type="number" min={0} placeholder="–" aria-label={`${r.label}: daily limit`} className={input} />
                  <input name="maxPerYear" defaultValue={r.maxPerYear ?? ""} type="number" min={0} placeholder="–" aria-label={`${r.label}: yearly limit`} className={input} />
                  <input name="isActive" type="checkbox" defaultChecked={r.isActive} aria-label={`${r.label}: active`} className="size-4 accent-primary" />
                  <ActionButton className={buttonClasses({ size: "sm", variant: "secondary" })} pendingLabel="…">
                    Save<span className="sr-only"> {r.label}</span>
                  </ActionButton>
                </form>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">Leave a limit blank for no limit.</p>
          </CardBody>
        </Card>
      </div>

      {/* Adjustments */}
      <Card id="adjust" className="mt-6 scroll-mt-24">
        <CardHeader title="Adjust a member's points" description="For corrections or offline participation. Use a negative number to remove points." />
        <CardBody className="space-y-4">
          <form action={adjustPoints} className="flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1">
              <label htmlFor="adj-email" className="block text-xs font-semibold text-ink-muted">
                Member email
              </label>
              <input id="adj-email" name="email" type="email" required className={cn(input, "mt-1")} />
            </div>
            <div className="w-28">
              <label htmlFor="adj-points" className="block text-xs font-semibold text-ink-muted">
                Points (±)
              </label>
              <input id="adj-points" name="points" type="number" required min={-5000} max={5000} className={cn(input, "mt-1")} />
            </div>
            <div className="min-w-64 flex-[2]">
              <label htmlFor="adj-reason" className="block text-xs font-semibold text-ink-muted">
                Reason (the member sees this)
              </label>
              <input id="adj-reason" name="reason" required maxLength={300} placeholder="e.g. Attended the Nov 12 lunch & learn" className={cn(input, "mt-1")} />
            </div>
            <ActionButton className={buttonClasses({ size: "sm" })} pendingLabel="Saving…">
              Apply
            </ActionButton>
          </form>
          {adjustments.length > 0 && (
            <ul className="space-y-1 border-t border-border pt-3 text-sm text-ink-muted">
              {adjustments.map((a) => (
                <li key={a.id}>
                  {fmtDay(a.createdAt)} · {a.user.name} ·{" "}
                  <span className={cn("font-semibold tabular-nums", a.points < 0 ? "text-accent" : "text-ink")}>
                    {a.points > 0 ? "+" : ""}
                    {a.points}
                  </span>{" "}
                  · {a.description.replace(/^Adjustment: /, "")}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </>
  );
}
