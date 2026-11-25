"use client";

import { startTransition, useActionState, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/field";
import { control } from "@/components/admin/form-fields";
import { MARKERS, SOURCE_LABELS } from "@/lib/biometrics";
import { cn } from "@/lib/utils";
import { importScreenings, type ImportState } from "./actions";

const INITIAL: ImportState = { done: false, error: null, created: 0, updated: 0, pointsAwarded: 0, problems: [] };

export function ImportForm() {
  const [state, action, pending] = useActionState(importScreenings, INITIAL);
  const [tooBig, setTooBig] = useState(false);
  const sample = `email,screened_on,bp_systolic,bp_diastolic,ldl,a1c\nmember@example.com,2026-10-14,118,76,95,5.4`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const file = data.get("file");
        // Checked here too: the server rejects bodies over 1 MB before our action runs.
        const big = file instanceof File && file.size > 900_000;
        setTooBig(big);
        if (!big) startTransition(() => action(data));
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="file" className="block text-sm font-semibold text-ink">
            CSV file
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="mt-1.5 block w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-soft/70"
          />
        </div>
        <div>
          <label htmlFor="source" className="block text-sm font-semibold text-ink">
            Source
          </label>
          <select id="source" name="source" defaultValue="lab" className={cn(control, "mt-1.5 h-10")}>
            {(["onsite", "lab", "physician_form"] as const).map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-muted">Used when a row has no source column.</p>
        </div>
      </div>
      <div>
        <label htmlFor="csv" className="block text-sm font-semibold text-ink">
          Or paste rows
        </label>
        <textarea id="csv" name="csv" rows={4} placeholder={sample} className={cn(control, "mt-1.5 py-2.5 font-mono text-xs")} />
      </div>
      <details className="text-xs text-ink-muted">
        <summary className="cursor-pointer font-semibold hover:text-ink">File format</summary>
        <p className="mt-2">
          A header row, then one row per screening. Required: <code>email</code> and <code>screened_on</code> (YYYY-MM-DD or M/D/YYYY). Optional:{" "}
          <code>source</code> (onsite, lab, physician_form). Result columns (blank cells are skipped):
        </p>
        <p className="mt-1 font-mono">{MARKERS.map((m) => m.key).join(", ")}</p>
        <p className="mt-1">Re-importing the same member, date and source replaces those results, so a corrected file is safe to load again.</p>
      </details>

      <FormError message={tooBig ? "That file is over 900 KB. Split it into smaller files." : state.error} />
      {state.done && (
        <div role="status" className="space-y-2 rounded-xl bg-surface-muted p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            {state.created} new, {state.updated} updated · {state.pointsAwarded.toLocaleString()} points awarded
          </p>
          {state.problems.length > 0 && (
            <div>
              <p className="flex items-center gap-2 font-semibold text-warning">
                <AlertTriangle className="size-4" aria-hidden /> {state.problems.length} row{state.problems.length === 1 ? "" : "s"} skipped
              </p>
              <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto text-xs text-ink-muted">
                {state.problems.map((p, i) => (
                  <li key={i}>
                    Line {p.line}: {p.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Button type="submit" disabled={pending}>
        <Upload className="size-4" aria-hidden /> {pending ? "Importing…" : "Import results"}
      </Button>
    </form>
  );
}
