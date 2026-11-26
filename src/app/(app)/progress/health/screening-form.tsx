"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/field";
import { control } from "@/components/admin/form-fields";
import { MARKERS } from "@/lib/biometrics";
import { cn } from "@/lib/utils";
import { saveSelfReportedScreening, type ScreeningState } from "../actions";

export function ScreeningForm({ today, earliest }: { today: string; earliest: string }) {
  const [state, action, pending] = useActionState<ScreeningState, FormData>(saveSelfReportedScreening, { error: null, ok: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the numbers after a successful save.
  useEffect(() => {
    if (state.ok) formRef.current?.querySelectorAll<HTMLInputElement>("input[type=number]").forEach((i) => (i.value = ""));
  }, [state]);

  return (
    <form
      ref={formRef}
      // Manual submit keeps entries when something's wrong (React resets forms after `action`).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <div className="max-w-48">
        <label htmlFor="screenedOn" className="block text-sm font-semibold text-ink">
          Date of screening
        </label>
        <input id="screenedOn" name="screenedOn" type="date" defaultValue={today} min={earliest} max={today} required className={cn(control, "mt-1.5 h-11")} />
      </div>
      <fieldset>
        <legend className="text-sm font-semibold text-ink">Results</legend>
        <p className="text-xs text-ink-muted">Fill in whatever you have; leave the rest blank.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MARKERS.map((m) => (
            <div key={m.key}>
              <label htmlFor={`m_${m.key}`} className="block text-xs font-semibold text-ink-muted">
                {m.label}
                {m.unit && <span className="font-normal"> ({m.unit})</span>}
              </label>
              <input
                id={`m_${m.key}`}
                name={`m_${m.key}`}
                type="number"
                inputMode="decimal"
                min={m.min}
                max={m.max}
                step={m.decimals ? 0.1 : 1}
                className={cn(control, "mt-1 h-10")}
              />
            </div>
          ))}
        </div>
      </fieldset>
      <FormError message={state.error} />
      {/* Always mounted, so screen readers announce the text when it changes. */}
      <p role="status" className="sr-only">
        {state.ok ?? ""}
      </p>
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden /> {state.ok}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save results"}
      </Button>
    </form>
  );
}
