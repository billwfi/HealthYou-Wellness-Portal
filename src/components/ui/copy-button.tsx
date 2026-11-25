"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Copies `path` as a full URL on this site. */
export function CopyLinkButton({ path, label, className }: { path: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline", className)}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : label}</span>
    </button>
  );
}
