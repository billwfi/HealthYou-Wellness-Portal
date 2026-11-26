import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import type { ChallengeMetric, ChallengeType, TeamMode } from "@/lib/domain";
import { parseEligibility } from "@/lib/challenges";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChallengeForm } from "../challenge-form";
import { saveChallenge } from "../actions";

export const metadata: Metadata = { title: "Admin: Edit challenge" };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const str = (d: { toString(): string } | null) => (d == null ? "" : d.toString());

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const c = await db.challenge.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } }, milestones: { orderBy: { threshold: "asc" } } } });
  if (!c) notFound();
  const elig = parseEligibility(c.eligibility);
  const locked = c.status === "completed" || c.status === "archived";

  return (
    <>
      <Link href="/admin/challenges" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Challenges
      </Link>
      <PageHeader
        eyebrow="Edit challenge"
        title={c.name}
        action={
          <Link href={`/challenges/${c.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View as member<span className="sr-only"> (opens in a new tab)</span> <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        }
      />
      {locked ? (
        <Card className="p-5 text-sm text-ink-muted">
          This challenge is {c.status === "completed" ? "finished" : "archived"}, so it can&apos;t be edited. Its results and points are kept.
        </Card>
      ) : (
        <ChallengeForm
          action={saveChallenge.bind(null, c.id)}
          challengeId={c.id}
          enrollments={c._count.enrollments}
          initial={{
            name: c.name,
            slug: c.slug,
            description: c.description ?? "",
            type: c.type as ChallengeType,
            metric: c.metric as ChallengeMetric,
            goalValue: str(c.goalValue),
            dailyGoal: str(c.dailyGoal),
            dailyCap: str(c.dailyCap),
            startDate: iso(c.startDate),
            endDate: iso(c.endDate),
            teamMode: (c.teamMode as TeamMode) ?? "individual",
            maxTeamSize: c.maxTeamSize?.toString() ?? "",
            pointsOnCompletion: String(c.pointsOnCompletion),
            published: c.status !== "draft",
            templateId: c.templateId?.toString() ?? "",
            milestones: c.milestones.map((m) => ({ label: m.label, threshold: m.threshold.toString(), points: String(m.points) })),
            eligMemberTypes: elig.memberTypes ?? [],
            eligDepartments: (elig.departments ?? []).join("\n"),
          }}
        />
      )}
    </>
  );
}
