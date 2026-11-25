import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { addDays, programToday } from "@/lib/dates";
import { CHALLENGE_TYPE_META, METRIC_META } from "@/lib/challenges";
import type { ChallengeMetric, ChallengeType } from "@/lib/domain";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChallengeForm } from "../challenge-form";
import { saveChallenge } from "../actions";

export const metadata: Metadata = { title: "Admin: New challenge" };

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function NewChallengePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  await requireAdmin();
  const { template: templateSlug } = await searchParams;
  const templates = await db.challengeTemplate.findMany({ orderBy: { id: "asc" } });
  const t = templates.find((x) => x.slug === templateSlug);

  // Default: starts next Monday.
  const today = programToday();
  const start = addDays(today, ((8 - today.getUTCDay()) % 7) || 7);
  const end = addDays(start, (t?.durationDays ?? 28) - 1);
  const year = start.getUTCFullYear();

  return (
    <>
      <Link href="/admin/challenges" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Challenges
      </Link>
      <PageHeader eyebrow="Admin" title="New challenge" description="Start from a template or from scratch. You can change anything before publishing." />
      <ChallengeForm
        key={t?.slug ?? "blank"}
        action={saveChallenge.bind(null, null)}
        header={
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <LayoutTemplate className="size-4" aria-hidden /> Template library
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/admin/challenges/new"
                aria-current={!t ? "page" : undefined}
                className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", !t ? "border-primary bg-primary-soft text-primary ring-1 ring-primary" : "border-border text-ink-muted hover:bg-surface-muted")}
              >
                Blank
              </Link>
              {templates.map((x) => (
                <Link
                  key={x.id}
                  href={`/admin/challenges/new?template=${x.slug}`}
                  title={x.description ?? undefined}
                  aria-current={t?.id === x.id ? "page" : undefined}
                  className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", t?.id === x.id ? "border-primary bg-primary-soft text-primary ring-1 ring-primary" : "border-border text-ink-muted hover:bg-surface-muted")}
                >
                  {x.name}
                  <span className="ml-1 font-normal">· {CHALLENGE_TYPE_META[x.type as ChallengeType]?.label ?? x.type}</span>
                </Link>
              ))}
            </div>
            {t?.description && <p className="mt-3 text-sm text-ink-muted">{t.description}</p>}
          </Card>
        }
        initial={{
          name: t ? `${t.name} ${year}` : "",
          slug: t ? slugify(`${t.name} ${year}`) : "",
          description: t?.description ?? "",
          type: (t?.type as ChallengeType) ?? "target",
          metric: (t?.metric && t.metric in METRIC_META ? (t.metric as ChallengeMetric) : "active_minutes"),
          goalValue: t?.goalValue?.toString() ?? "",
          dailyGoal: t && (t.type === "streak" || t.type === "stick_to_it") ? "1" : "",
          dailyCap: "",
          startDate: iso(start),
          endDate: iso(end),
          teamMode: "hybrid",
          maxTeamSize: "10",
          pointsOnCompletion: "100",
          published: false,
          templateId: t ? String(t.id) : "",
          milestones: t?.goalValue && !(t.type === "streak" || t.type === "stick_to_it")
            ? [
                { label: "Halfway there", threshold: String(Number(t.goalValue.toString()) / 2), points: "25" },
              ]
            : [],
          eligMemberTypes: [],
          eligDepartments: "",
        }}
      />
    </>
  );
}
