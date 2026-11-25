import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, HeartPulse, Plus, ShieldCheck, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import { addDays, programDay, programToday } from "@/lib/dates";
import { formatMarker, MARKERS, meetsTarget, SOURCE_LABELS, type ScreeningSource } from "@/lib/biometrics";
import { getBiometricHistory } from "@/server/screenings";
import { PageBanner } from "@/components/brand/page-banner";
import { PATH_PHOTOS } from "@/components/brand/photos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section-title";
import { LineChart } from "@/components/charts/line-chart";
import { ActionButton } from "@/components/content/action-button";
import { buttonClasses } from "@/components/ui/button";
import { control } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";
import { clearBiometricGoal, setBiometricGoal } from "../actions";
import { ScreeningForm } from "./screening-form";

export const metadata: Metadata = { title: "Health numbers" };

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);

export default async function HealthPage() {
  const user = await requireUser();
  const { screenings, series, goals } = await getBiometricHistory(user.id);
  const today = programToday();
  const tracked = MARKERS.filter((m) => series.has(m.key));

  return (
    <>
      <Link href="/progress" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Progress
      </Link>
      <PageBanner
        photo={PATH_PHOTOS.mind}
        eyebrow="Health numbers"
        title="Know your numbers"
        description="Track your screening results over time and set your own targets. Rewards come from taking part, never from your results."
      />

      {tracked.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {tracked.map((m) => {
            const points = series.get(m.key)!;
            const latest = points[points.length - 1];
            const goal = goals.get(m.key);
            const met = goal ? meetsTarget(latest.value, goal.target, goal.direction) : null;
            return (
              <Card key={m.key} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-ink">{m.label}</h2>
                    <p className="text-sm text-ink-muted">
                      Latest {formatMarker(latest.value, m.key)} on {fmtDay(latest.date)}
                      {m.reference && <> · Typical adult range: {m.reference}</>}
                    </p>
                  </div>
                  {met != null && (
                    <Badge tone={met ? "success" : "neutral"}>
                      {met ? <CheckCircle2 className="size-3" aria-hidden /> : <Target className="size-3" aria-hidden />}
                      {met ? "At target" : "Working on it"}
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  <LineChart
                    points={points}
                    title={`${m.label} over time`}
                    format={(v) => formatMarker(v, m.key)}
                    target={goal ? { value: goal.target, label: `Target ${goal.direction === "above" ? "≥" : "≤"} ${formatMarker(goal.target, m.key).split(" ")[0]}` } : undefined}
                  />
                </div>
                <form action={setBiometricGoal.bind(null, m.key)} className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
                  <div>
                    <label htmlFor={`dir-${m.key}`} className="block text-xs font-semibold text-ink-muted">
                      My target
                    </label>
                    <select
                      id={`dir-${m.key}`}
                      name="direction"
                      defaultValue={goal?.direction ?? (m.better === "higher" ? "above" : "below")}
                      className={cn(control, "mt-1 h-9 w-32 text-sm")}
                    >
                      <option value="below">At or below</option>
                      <option value="above">At or above</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`target-${m.key}`} className="sr-only">
                      Target value for {m.label}
                    </label>
                    <input
                      id={`target-${m.key}`}
                      name="target"
                      type="number"
                      inputMode="decimal"
                      min={m.min}
                      max={m.max}
                      step={m.decimals ? 0.1 : 1}
                      required
                      defaultValue={goal?.target}
                      placeholder={m.unit || "value"}
                      className={cn(control, "h-9 w-28 text-sm")}
                    />
                  </div>
                  <ActionButton className={buttonClasses({ variant: "secondary", size: "sm" })} pendingLabel="Saving…">
                    {goal ? "Update" : "Set target"}
                  </ActionButton>
                  {goal && (
                    <button
                      formAction={clearBiometricGoal.bind(null, m.key)}
                      formNoValidate
                      className="h-8 rounded-full px-3 text-sm font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </form>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          <SectionTitle icon={HeartPulse} tone="red" title="No results yet" description="Results from City screenings are added by the wellness team. You can also enter your own below." />
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card id="add" className="scroll-mt-24 p-5">
          <SectionTitle icon={Plus} tone="blue" title="Add your own results" description="From a doctor's visit or another screening" />
          <div className="mt-4">
            <ScreeningForm today={programDay()} earliest={addDays(today, -730).toISOString().slice(0, 10)} />
          </div>
        </Card>

        <Card className="self-start p-5">
          <SectionTitle icon={ShieldCheck} tone="green" title="Your screenings" />
          {screenings.length ? (
            <ul className="mt-4 space-y-3">
              {[...screenings].reverse().map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3 text-sm">
                  <span>
                    <span className="block font-semibold text-ink">{fmtDay(s.screenedOn)}</span>
                    <span className="text-xs text-ink-muted">
                      {SOURCE_LABELS[s.source as ScreeningSource] ?? s.source} · {s.results.length} result{s.results.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  {s.verifiedAt ? (
                    <Badge tone="success">
                      <CheckCircle2 className="size-3" aria-hidden /> Verified
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      <Clock className="size-3" aria-hidden /> Awaiting review
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">None yet.</p>
          )}
          <p className="mt-4 border-t border-border pt-3 text-xs text-ink-muted">
            Only you and the wellness program&apos;s administrators can see your individual results.
          </p>
        </Card>
      </div>
    </>
  );
}
