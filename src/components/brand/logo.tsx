import { cn } from "@/lib/utils";

/** Reach Your Peak wordmark with a simple peak glyph. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path d="M5 24 13 11l4 6 3-4 7 11Z" fill="white" />
        <path d="m13 11 2.2 3.4L13 13.6l-1.6 1.8Z" className="fill-accent" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">Colorado Springs</span>
          <span className="block text-[15px] font-extrabold tracking-tight text-ink">
            Reach Your <span className="text-accent">Peak</span>
          </span>
        </span>
      )}
    </span>
  );
}
