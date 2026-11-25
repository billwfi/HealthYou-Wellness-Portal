import type { ReactNode } from "react";

/** Shared input styling for admin editors; red border when aria-invalid. */
export const control =
  "block w-full rounded-xl border border-border bg-surface px-3.5 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-accent";

/** Props that tie an input to its error message. */
export function invalidProps(id: string, error: string | undefined) {
  return { "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-error` : undefined } as const;
}

export function FieldShell({ id, label, hint, error, children, optional }: { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-ink-subtle">(optional)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-accent">
          {error}
        </p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}
