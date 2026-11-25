"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button that disables itself and dims while its form's action runs. */
export function ActionButton({ className, children, pendingLabel, ...props }: ComponentProps<"button"> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={cn(className, pending && "opacity-60")} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
