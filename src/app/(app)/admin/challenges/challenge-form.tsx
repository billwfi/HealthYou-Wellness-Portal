"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, useTransition, type ReactNode } from "react";
import { Archive, Trash2 } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/auth/field";
import { control, FieldShell, invalidProps } from "@/components/admin/form-fields";
import { CHALLENGE_METRICS, CHALLENGE_TYPES, TEAM_MODES, type ChallengeMetric, type ChallengeType, type TeamMode } from "@/lib/domain";
import { CHALLENGE_TYPE_META, isDayScored, METRIC_META, TEAM_MODE_META } from "@/lib/challenges";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { removeChallenge, type ChallengeFormState } from "./actions";

export type ChallengeFormValues = {
  name: string;
  slug: string;
  description: string;
  type: ChallengeType;
  metric: ChallengeMetric;
  goalValue: string;
  dailyGoal: string;
  dailyCap: string;
  startDate: string;
  endDate: string;
  teamMode: TeamMode;
  maxTeamSize: string;
  pointsOnCompletion: string;
  published: boolean;
  templateId: string;
};

function Radio<T extends string>({ name, value, checked, onChange, title, hint }: { name: string; value: T; checked: boolean; onChange: (v: T) => void; title: string; hint: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="peer sr-only" />
      <span className="block h-full rounded-xl border border-border p-3 transition-colors hover:bg-surface-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
      </span>
    </label>
  );
}

export function ChallengeForm({
  action,
  initial,
  challengeId,
  enrollments = 0,
  header,
}: {
  action: (prev: ChallengeFormState, formData: FormData) => Promise<ChallengeFormState>;
  initial: ChallengeFormValues;
  challengeId?: number;
  enrollments?: number;
  header?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null, fieldErrors: {} });
  const [removing, startRemove] = useTransition();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(challengeId));
  const [type, setType] = useState(initial.type);
  const [metric, setMetric] = useState(initial.metric);
  const [teamMode, setTeamMode] = useState(initial.teamMode);
  const [published, setPublished] = useState(initial.published);
  const fe = state.fieldErrors;
  const typeMeta = CHALLENGE_TYPE_META[type];
  const unit = METRIC_META[metric].unit;
  const field = (id: keyof ChallengeFormValues) => ({ id, name: id, defaultValue: initial[id] as string, ...invalidProps(id, fe[id]) });

  return (
    <form
      // Manual submit keeps the admin's input when validation fails (React resets forms after `action`).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
    >
      <input type="hidden" name="templateId" value={initial.templateId} />
      <div className="space-y-6">
        {header}
        <Card className="space-y-5 p-5">
          <FieldShell id="name" label="Name" error={fe.name}>
            <input
              id="name"
              name="name"
              value={name}
              maxLength={200}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={cn(control, "h-11")}
              {...invalidProps("name", fe.name)}
            />
          </FieldShell>
          <FieldShell id="slug" label="Web address" error={fe.slug} hint={`/challenges/${slug || "…"}`}>
            <input
              id="slug"
              name="slug"
              value={slug}
              maxLength={150}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className={cn(control, "h-11 font-mono text-sm")}
              {...invalidProps("slug", fe.slug)}
            />
          </FieldShell>
          <FieldShell id="description" label="Description" optional error={fe.description}>
            <textarea {...field("description")} rows={3} maxLength={1000} className={cn(control, "py-2.5")} />
          </FieldShell>
        </Card>

        <Card className="space-y-5 p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Type</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {CHALLENGE_TYPES.map((t) => (
                <Radio key={t} name="type" value={t} checked={type === t} onChange={setType} title={CHALLENGE_TYPE_META[t].label} hint={CHALLENGE_TYPE_META[t].summary} />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell id="metric" label="What counts" error={fe.metric} hint={METRIC_META[metric].hint}>
              <select id="metric" name="metric" value={metric} onChange={(e) => setMetric(e.target.value as ChallengeMetric)} className={cn(control, "h-11")}>
                {CHALLENGE_METRICS.map((m) => (
                  <option key={m} value={m}>
                    {METRIC_META[m].label}
                  </option>
                ))}
              </select>
            </FieldShell>
            {typeMeta.goal === "required" && (
              <FieldShell id="goalValue" label={typeMeta.goalLabel ?? "Goal"} error={fe.goalValue} hint={isDayScored(type) ? "days" : unit}>
                <input {...field("goalValue")} type="number" min={0} step="any" inputMode="decimal" className={cn(control, "h-11")} />
              </FieldShell>
            )}
            {isDayScored(type) && (
              <FieldShell id="dailyGoal" label="Daily goal" error={fe.dailyGoal} hint={`${unit} needed for a day to count (default 1)`}>
                <input {...field("dailyGoal")} type="number" min={0} step="any" inputMode="decimal" className={cn(control, "h-11")} />
              </FieldShell>
            )}
            <FieldShell id="dailyCap" label="Daily cap" optional error={fe.dailyCap} hint={`Most ${unit} that count per day. Keeps it fair.`}>
              <input {...field("dailyCap")} type="number" min={0} step="any" inputMode="decimal" className={cn(control, "h-11")} />
            </FieldShell>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Who can join</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {TEAM_MODES.map((m) => (
                <Radio key={m} name="teamMode" value={m} checked={teamMode === m} onChange={setTeamMode} title={TEAM_MODE_META[m].label} hint={TEAM_MODE_META[m].summary} />
              ))}
            </div>
          </fieldset>
          {teamMode !== "individual" && (
            <div className="max-w-48">
              <FieldShell id="maxTeamSize" label="Max team size" optional error={fe.maxTeamSize}>
                <input {...field("maxTeamSize")} type="number" min={2} inputMode="numeric" className={cn(control, "h-11")} />
              </FieldShell>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Status</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="status" value={s} checked={published === (s === "published")} onChange={() => setPublished(s === "published")} className="peer sr-only" />
                  <span className="block rounded-xl border border-border px-3 py-2 text-center text-sm font-semibold text-ink-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
                    {s === "draft" ? "Draft" : "Published"}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-muted">{published ? "Members can see and join it." : "Only admins can see drafts."}</p>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <FieldShell id="startDate" label="Starts" error={fe.startDate}>
              <input {...field("startDate")} type="date" className={cn(control, "h-11")} />
            </FieldShell>
            <FieldShell id="endDate" label="Ends" error={fe.endDate}>
              <input {...field("endDate")} type="date" className={cn(control, "h-11")} />
            </FieldShell>
          </div>
          <FieldShell id="pointsOnCompletion" label="Points" error={fe.pointsOnCompletion} hint={type === "leaderboard" || type === "group_goal" ? "For everyone who takes part, when you finish it." : "For reaching the goal."}>
            <input {...field("pointsOnCompletion")} type="number" min={0} inputMode="numeric" className={cn(control, "h-11")} />
          </FieldShell>
          {enrollments > 0 && (
            <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
              {enrollments} member{enrollments === 1 ? " has" : "s have"} joined. Changing what counts, the dates or the cap recalculates their progress.
            </p>
          )}
          <FormError message={state.error} />
          <div className="flex gap-2">
            <Button type="submit" disabled={pending || removing} className="flex-1">
              {pending ? "Saving…" : challengeId ? "Save changes" : "Create challenge"}
            </Button>
            <Link href="/admin/challenges" className={buttonClasses({ variant: "ghost" })}>
              Cancel
            </Link>
          </div>
        </Card>

        {challengeId && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">{enrollments ? "Archive" : "Delete"}</h2>
            <p className="mt-1 text-xs text-ink-muted">
              {enrollments ? "Hides it from members. Progress and earned points are kept." : "Nobody has joined, so it can be deleted for good."}
            </p>
            <button
              type="button"
              disabled={removing || pending}
              onClick={() => {
                if (confirm(enrollments ? `Archive “${initial.name}”?` : `Delete “${initial.name}”? This can't be undone.`)) startRemove(() => removeChallenge(challengeId));
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-50"
            >
              {enrollments ? <Archive className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              {removing ? "Working…" : enrollments ? "Archive challenge" : "Delete challenge"}
            </button>
          </Card>
        )}
      </div>
    </form>
  );
}
