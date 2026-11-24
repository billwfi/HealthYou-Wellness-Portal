import type { ReactNode } from "react";
import { cn, type WellnessPath } from "@/lib/utils";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | WellnessPath;

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  body: "bg-path-body-soft text-path-body",
  life: "bg-path-life-soft text-path-life",
  mind: "bg-path-mind-soft text-path-mind",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
