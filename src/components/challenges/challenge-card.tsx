import Link from "next/link";
import { CheckCircle2, Flame, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CHALLENGE_TYPE_META, daysBetweenInclusive, formatAmount, isDayScored, METRIC_META, type ChallengePhase } from "@/lib/challenges";
import type { ChallengeMetric, ChallengeType } from "@/lib/domain";
import type { ChallengeListItem } from "@/server/challenge-list";

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

export function phaseLabel(phase: ChallengePhase, start: Date, end: Date, today: Date) {
  if (phase === "upcoming") {
    const n = daysBetweenInclusive(today, start) - 1;
    return n === 1 ? "Starts tomorrow" : `Starts in ${n} days`;
  }
  if (phase === "active") {
    const n = daysBetweenInclusive(today, end);
    return n === 1 ? "Last day" : `${n} days left`;
  }
  if (phase === "ended") return "Ended · results pending";
  if (phase === "finalized") return "Finished";
  return phase === "draft" ? "Draft" : "Archived";
}

/** Score in the challenge's own terms, e.g. "4,200 steps" or "6 days". */
export function scoreText(score: number, type: string, metric: string) {
  return isDayScored(type) ? `${score} day${score === 1 ? "" : "s"}` : formatAmount(score, metric);
}

export function ChallengeCard({ item, today }: { item: ChallengeListItem; today: Date }) {
  const { challenge: c, phase, enrollment, summary, participants } = item;
  const typeMeta = CHALLENGE_TYPE_META[c.type as ChallengeType];
  const metric = METRIC_META[c.metric as ChallengeMetric];
  const goal = summary?.goal;

  return (
    <Link href={`/challenges/${c.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-pop">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{typeMeta?.label ?? c.type}</Badge>
          <span className="text-xs font-semibold text-ink-muted">{metric?.label ?? c.metric}</span>
          {enrollment?.completedAt && (
            <Badge tone="success">
              <CheckCircle2 className="size-3" aria-hidden /> Completed
            </Badge>
          )}
        </div>
        <h3 className="mt-3 font-bold text-ink group-hover:text-primary">{c.name}</h3>
        {c.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{c.description}</p>}

        {summary && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-bold text-ink">{scoreText(summary.score, c.type, c.metric)}</span>
              {goal != null && summary.pct != null && <span className="text-ink-muted">of {scoreText(goal, c.type, c.metric)}</span>}
            </div>
            {summary.pct != null && (
              <ProgressBar value={summary.pct} label={`Progress in ${c.name}`} tone={enrollment?.completedAt ? "success" : "primary"} className="mt-1.5" />
            )}
            {isDayScored(c.type) && summary.currentStreak > 0 && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-warning">
                <Flame className="size-3.5" aria-hidden /> {summary.currentStreak}-day streak
              </p>
            )}
            {enrollment?.team && <p className="mt-1 text-xs text-ink-muted">Team {enrollment.team.name}</p>}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-ink-muted">
          <span>
            {fmtDay(c.startDate)} – {fmtDay(c.endDate)} · {phaseLabel(phase, c.startDate, c.endDate, today)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden /> {participants}
          </span>
        </div>
      </Card>
    </Link>
  );
}
