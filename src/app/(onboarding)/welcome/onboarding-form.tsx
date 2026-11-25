"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormError } from "@/components/auth/field";
import { MEMBER_TYPES, WELLNESS_PATHS, type MemberType, type WellnessPath } from "@/lib/domain";
import { GOAL_MAX_LENGTH, MAX_HABITS, SUGGESTED_GOALS } from "@/lib/goals";
import { cn, PATHS } from "@/lib/utils";
import { saveOnboarding, type OnboardingState } from "./actions";

type Tag = { id: number; label: string; path: WellnessPath };
type Habit = { id: number; title: string; path: WellnessPath; tagId: number | null; points: number };

const STEPS = ["About you", "Interests", "Goals", "Habits"] as const;

const MEMBER_TYPE_LABELS: Record<MemberType, { label: string; hint: string }> = {
  employee: { label: "City employee", hint: "Full- or part-time" },
  spouse: { label: "Spouse or partner", hint: "Of a City employee" },
  retiree: { label: "Retiree", hint: "City of Colorado Springs" },
};

// Static class names per path so Tailwind can see them.
const CHOSEN: Record<WellnessPath, string> = {
  body: "peer-checked:border-path-body peer-checked:bg-path-body-soft peer-checked:text-path-body",
  life: "peer-checked:border-path-life peer-checked:bg-path-life-soft peer-checked:text-path-life",
  mind: "peer-checked:border-path-mind peer-checked:bg-path-mind-soft peer-checked:text-path-mind",
};

const inputClass =
  "block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15";

export function OnboardingForm({
  firstName,
  editing,
  tags,
  habits,
  initial,
}: {
  firstName: string;
  editing: boolean;
  tags: Tag[];
  habits: Habit[];
  initial: { memberType: MemberType; department: string; tagIds: number[]; goals: Record<WellnessPath, string>; habitIds: number[] };
}) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(saveOnboarding, { error: null });
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [memberType, setMemberType] = useState(initial.memberType);
  const [tagIds, setTagIds] = useState(() => new Set(initial.tagIds));
  const [goals, setGoals] = useState(initial.goals);
  const [habitIds, setHabitIds] = useState(() => new Set(initial.habitIds));

  const last = STEPS.length - 1;

  function next() {
    if (step === 1 && tagIds.size === 0) {
      setStepError("Pick at least one interest so we can personalize your feed.");
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(last, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggle<T>(set: Set<T>, value: T) {
    const copy = new Set(set);
    if (copy.has(value)) copy.delete(value);
    else copy.add(value);
    return copy;
  }

  // Habits tied to a chosen interest come first and are marked "For you".
  const suggestedHabits = new Set(habits.filter((h) => h.tagId != null && tagIds.has(h.tagId)).map((h) => h.id));
  const orderedHabits = [...habits].sort((a, b) => Number(suggestedHabits.has(b.id)) - Number(suggestedHabits.has(a.id)));

  return (
    <form
      action={action}
      // Enter in a text field moves to the next step instead of submitting early.
      onSubmit={(e) => {
        if (step < last) {
          e.preventDefault();
          next();
        }
      }}
      className="space-y-8"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {editing ? "Update your profile" : `Welcome, ${firstName}`}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {step === 0 && "Let's make Reach Your Peak yours"}
          {step === 1 && "What would you like to focus on?"}
          {step === 2 && "Set a goal for each path"}
          {step === 3 && "Pick a few daily habits"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {step === 0 && "A few quick questions so we can show you what matters. It takes about a minute."}
          {step === 1 && "Choose any topics across Body, Life and Mind. We use them to pick content for your Today feed."}
          {step === 2 && "Optional, but goals help us recommend the right things. Pick one or write your own."}
          {step === 3 && `Check them off each day to build streaks and earn points. Choose up to ${MAX_HABITS}.`}
        </p>
      </div>

      {/* Stepper */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-surface-muted")} />
            <span className={cn("mt-2 block text-xs font-semibold", i === step ? "text-ink" : "text-ink-subtle")}>{label}</span>
          </li>
        ))}
      </ol>

      {/* Step 1: about you. Sections stay mounted (just hidden) so every answer is submitted. */}
      <section hidden={step !== 0} className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">How are you connected to the City?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MEMBER_TYPES.map((t) => (
              <label key={t} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  value={t}
                  checked={memberType === t}
                  onChange={() => setMemberType(t)}
                  className="peer sr-only"
                />
                <span className="block h-full rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
                  <span className="block font-bold text-ink">{MEMBER_TYPE_LABELS[t].label}</span>
                  <span className="mt-0.5 block text-sm text-ink-muted">{MEMBER_TYPE_LABELS[t].hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="department" className="block text-sm font-semibold text-ink">
            Department <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <input
            id="department"
            name="department"
            defaultValue={initial.department}
            maxLength={200}
            placeholder="e.g. Parks, Recreation & Cultural Services"
            className={cn(inputClass, "mt-1.5")}
          />
          <p className="mt-1 text-xs text-ink-muted">Used for department teams in challenges.</p>
        </div>
      </section>

      {/* Step 2: interests */}
      <section hidden={step !== 1} className="space-y-6">
        {WELLNESS_PATHS.map((path) => (
          <fieldset key={path}>
            <legend className="flex items-center gap-2">
              <Badge tone={path}>{PATHS[path].label}</Badge>
              <span className="text-sm text-ink-muted">{PATHS[path].tagline}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags
                .filter((t) => t.path === path)
                .map((t) => (
                  <label key={t.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="tag"
                      value={t.id}
                      checked={tagIds.has(t.id)}
                      onChange={() => setTagIds((s) => toggle(s, t.id))}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-muted peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15",
                        CHOSEN[path],
                      )}
                    >
                      {tagIds.has(t.id) && <Check className="size-4" aria-hidden />}
                      {t.label}
                    </span>
                  </label>
                ))}
            </div>
          </fieldset>
        ))}
        <p className="text-sm text-ink-muted" aria-live="polite">
          {tagIds.size} selected{tagIds.size > 0 && tagIds.size < 3 ? ". Picking 3 or more gives you a richer feed." : "."}
        </p>
      </section>

      {/* Step 3: goals */}
      <section hidden={step !== 2} className="space-y-5">
        {WELLNESS_PATHS.map((path) => (
          <div key={path} className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Badge tone={path}>{PATHS[path].label}</Badge>
              <label htmlFor={`goal_${path}`} className="text-sm font-semibold text-ink">
                My {PATHS[path].label.toLowerCase()} goal
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_GOALS[path].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoals((s) => ({ ...s, [path]: s[path] === g ? "" : g }))}
                  aria-pressed={goals[path] === g}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    goals[path] === g
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-ink-muted hover:bg-surface-muted",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              id={`goal_${path}`}
              name={`goal_${path}`}
              value={goals[path]}
              onChange={(e) => setGoals((s) => ({ ...s, [path]: e.target.value }))}
              maxLength={GOAL_MAX_LENGTH}
              placeholder="Or write your own"
              className={cn(inputClass, "mt-3")}
            />
          </div>
        ))}
      </section>

      {/* Step 4: habits */}
      <section hidden={step !== 3} className="space-y-3">
        {orderedHabits.map((h) => {
          const chosen = habitIds.has(h.id);
          const full = !chosen && habitIds.size >= MAX_HABITS;
          return (
            <label key={h.id} className={cn("block", full ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
              <input
                type="checkbox"
                name="habit"
                value={h.id}
                checked={chosen}
                disabled={full}
                onChange={() => setHabitIds((s) => toggle(s, h.id))}
                className="peer sr-only"
              />
              <span className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-md border",
                    chosen ? "border-primary bg-primary text-on-primary" : "border-border",
                  )}
                  aria-hidden
                >
                  {chosen && <Check className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{h.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge tone={h.path}>{PATHS[h.path].label}</Badge>
                    {suggestedHabits.has(h.id) && (
                      <Badge tone="primary">
                        <Sparkles className="size-3" aria-hidden /> For you
                      </Badge>
                    )}
                  </span>
                </span>
                <span className="text-sm font-semibold text-ink-muted">+{h.points} pts/day</span>
              </span>
            </label>
          );
        })}
        <p className="text-sm text-ink-muted" aria-live="polite">
          {habitIds.size} of {MAX_HABITS} chosen. You can change these any time from your profile.
        </p>
      </section>

      <FormError message={stepError ?? state.error} />

      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" aria-hidden /> Back
          </Button>
        ) : (
          <span />
        )}
        {step < last ? (
          <Button type="button" onClick={next}>
            Continue <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Start my journey"}
            {!pending && <Check className="size-4" aria-hidden />}
          </Button>
        )}
      </div>
    </form>
  );
}
