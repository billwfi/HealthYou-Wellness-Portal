import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  blue: "bg-peak-blue text-white",
  green: "bg-peak-green text-white",
  red: "bg-peak-red text-white",
  orange: "bg-peak-orange text-white",
  navy: "bg-peak-navy text-white",
} as const;

/** Section heading with a colored icon chip, in the logo's palette. */
export function SectionTitle({
  id,
  icon: Icon,
  tone,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl shadow-sm", TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id={id} className="text-base font-bold text-ink">
            {title}
          </h2>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
