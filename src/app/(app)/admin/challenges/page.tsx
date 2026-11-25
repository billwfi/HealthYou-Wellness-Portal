import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Flag, Plus, Trophy } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { CHALLENGE_TYPE_META, challengePhase, METRIC_META, type ChallengePhase } from "@/lib/challenges";
import type { ChallengeMetric, ChallengeType } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/content/action-button";
import { finalizeChallengeAction } from "./actions";

export const metadata: Metadata = { title: "Challenges" };

const PHASE_BADGE: Record<ChallengePhase, { label: string; tone: "neutral" | "primary" | "success" | "warning" }> = {
  draft: { label: "Draft", tone: "neutral" },
  upcoming: { label: "Upcoming", tone: "primary" },
  active: { label: "Active", tone: "success" },
  ended: { label: "Needs finishing", tone: "warning" },
  finalized: { label: "Finished", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};
const ORDER: ChallengePhase[] = ["ended", "active", "upcoming", "draft", "finalized", "archived"];
const fmt = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);

type Search = Promise<{ saved?: string; finalized?: string; removed?: string }>;

export default async function AdminChallengesPage({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const sp = await searchParams;
  const today = programToday();
  const rows = await db.challenge.findMany({
    include: { _count: { select: { enrollments: true, teams: true } } },
    orderBy: { startDate: "desc" },
  });
  const items = rows
    .map((c) => ({ c, phase: challengePhase(c, today) }))
    .sort((a, b) => ORDER.indexOf(a.phase) - ORDER.indexOf(b.phase));

  const notice = sp.saved
    ? `Saved “${rows.find((c) => String(c.id) === sp.saved)?.name ?? "challenge"}”.`
    : sp.finalized
      ? "Challenge finished. Points went to everyone who completed it."
      : sp.removed
        ? "Challenge removed."
        : null;

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Challenges"
        description="Build from a template, publish, and finish when it ends to award points."
        action={
          <ButtonLink href="/admin/challenges/new">
            <Plus className="size-4" aria-hidden /> New challenge
          </ButtonLink>
        }
      />
      {notice && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" aria-hidden /> {notice}
        </p>
      )}

      <Card className="overflow-hidden">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Challenge</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Dates</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Joined</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(({ c, phase }) => (
                  <tr key={c.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/challenges/${c.id}`} className="font-semibold text-ink hover:text-primary hover:underline">
                        {c.name}
                      </Link>
                      <span className="block text-xs text-ink-muted">
                        {CHALLENGE_TYPE_META[c.type as ChallengeType]?.label ?? c.type} · {METRIC_META[c.metric as ChallengeMetric]?.label ?? c.metric}
                        {c._count.teams > 0 && ` · ${c._count.teams} teams`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PHASE_BADGE[phase].tone}>{PHASE_BADGE[phase].label}</Badge>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted md:table-cell">
                      {fmt(c.startDate)} – {fmt(c.endDate)}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{c._count.enrollments}</td>
                    <td className="px-4 py-3 text-right">
                      {phase === "ended" && (
                        <form action={finalizeChallengeAction.bind(null, c.id)}>
                          <ActionButton className={buttonClasses({ size: "sm" })} pendingLabel="Finishing…" title="Close it and award points">
                            <Flag className="size-3.5" aria-hidden /> Finish
                          </ActionButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Trophy} title="No challenges yet" action={<ButtonLink href="/admin/challenges/new" variant="secondary">New challenge</ButtonLink>}>
            Pick a template to get started in a minute.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
