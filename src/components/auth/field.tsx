import type { ComponentProps } from "react";

export function Field({ label, id, hint, ...props }: ComponentProps<"input"> & { label: string; id: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="mt-1.5 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent">
      {message}
    </p>
  );
}

/** Only allow same-site relative redirects. */
export function safeNext(next: string | undefined | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
