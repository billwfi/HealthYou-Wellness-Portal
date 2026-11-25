import { cn } from "@/lib/utils";

/** Horizontal progress; `value` is 0–1. */
export function ProgressBar({ value, label, className, tone = "primary" }: { value: number; label: string; className?: string; tone?: "primary" | "success" }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-2 overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-700", tone === "success" ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
    </div>
  );
}
