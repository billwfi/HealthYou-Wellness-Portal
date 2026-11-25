"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { deleteContent } from "./actions";

/** Plain button (not a form): it sits inside the editor's form. */
export function DeleteContentButton({ id, title, interactions }: { id: number; title: string; interactions: number }) {
  const [pending, start] = useTransition();
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Delete</h2>
      <p className="mt-1 text-xs text-ink-muted">
        {interactions > 0
          ? `${interactions} member${interactions === 1 ? " has" : "s have"} saved or completed this. Their points stay; their saves are removed. Consider switching to Draft instead.`
          : "Removes this item permanently."}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete “${title}”? This can't be undone.`)) start(() => deleteContent(id));
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden /> {pending ? "Deleting…" : "Delete item"}
      </button>
    </Card>
  );
}
