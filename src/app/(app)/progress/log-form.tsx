"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/field";
import { control, FieldShell } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";
import { logActivity, type LogState } from "./actions";

type ActivityType = { id: number; name: string; unit: string; metric: string; category: string };

export function LogActivityForm({ types, today, earliest }: { types: ActivityType[]; today: string; earliest: string }) {
  const [state, action, pending] = useActionState<LogState, FormData>(logActivity, { error: null, ok: null });
  const [typeId, setTypeId] = useState(String(types[0]?.id ?? ""));
  const formRef = useRef<HTMLFormElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const type = types.find((t) => String(t.id) === typeId);

  // Clear the amount and notes after a successful log, keeping activity and date for the next one.
  useEffect(() => {
    if (!state.ok || !formRef.current) return;
    const form = formRef.current;
    (form.elements.namedItem("value") as HTMLInputElement).value = "";
    (form.elements.namedItem("notes") as HTMLInputElement).value = "";
    valueRef.current?.focus();
  }, [state]);

  const groups = [
    { label: "Exercise", items: types.filter((t) => t.category === "physical_activity") },
    { label: "Nutrition", items: types.filter((t) => t.category === "nutrition") },
  ];

  return (
    <form
      ref={formRef}
      // Manual submit keeps the fields when something's wrong (React resets forms after `action`).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell id="activityTypeId" label="Activity">
          <select id="activityTypeId" name="activityTypeId" value={typeId} onChange={(e) => setTypeId(e.target.value)} className={cn(control, "h-11")}>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.items.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FieldShell>
        <FieldShell id="entryDate" label="Date">
          <input id="entryDate" name="entryDate" type="date" defaultValue={today} min={earliest} max={today} required className={cn(control, "h-11")} />
        </FieldShell>
      </div>
      <FieldShell id="value" label={`Amount (${type?.unit ?? ""})`}>
        <input
          ref={valueRef}
          id="value"
          name="value"
          type="number"
          inputMode="decimal"
          min={0}
          step={type?.metric === "distance_miles" ? "0.1" : "1"}
          required
          placeholder={type?.metric === "steps" ? "e.g. 8000" : type?.metric === "distance_miles" ? "e.g. 2.5" : "e.g. 30"}
          className={cn(control, "h-11")}
        />
      </FieldShell>
      <FieldShell id="notes" label="Notes" optional>
        <input id="notes" name="notes" maxLength={500} className={cn(control, "h-11")} />
      </FieldShell>
      <FormError message={state.error} />
      {state.ok && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden /> {state.ok}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Logging…" : "Log activity"}
      </Button>
    </form>
  );
}
