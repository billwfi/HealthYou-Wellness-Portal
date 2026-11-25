import Link from "next/link";
import { Bookmark, BookmarkCheck, CheckCircle2, Sparkles, X } from "lucide-react";
import { dismissContent, toggleSaveContent } from "@/app/(app)/actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { WellnessPath } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { contentTypeMeta } from "./content-meta";

type Item = { id: number; slug: string; title: string; summary: string | null; type: string; path: string; provider: string | null };

const iconButton =
  "grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink";

/** A piece of content with its "why", plus save / dismiss controls. */
export function ContentCard({
  item,
  reason,
  saved,
  completed,
  dismissible = false,
}: {
  item: Item;
  reason?: string;
  saved: boolean;
  completed?: boolean;
  dismissible?: boolean;
}) {
  const path = item.path as WellnessPath;
  const { label, icon: Icon } = contentTypeMeta(item.type);
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={path}>{PATHS[path]?.label ?? path}</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted">
            <Icon className="size-3.5" aria-hidden /> {label}
          </span>
          {completed && (
            <Badge tone="success">
              <CheckCircle2 className="size-3" aria-hidden /> Done
            </Badge>
          )}
        </div>
        <div className="-mr-2 -mt-2 flex">
          <form action={toggleSaveContent.bind(null, item.id)}>
            <ActionButton className={iconButton} aria-label={saved ? `Unsave ${item.title}` : `Save ${item.title}`} aria-pressed={saved}>
              {saved ? <BookmarkCheck className="size-5 text-primary" aria-hidden /> : <Bookmark className="size-5" aria-hidden />}
            </ActionButton>
          </form>
          {dismissible && (
            <form action={dismissContent.bind(null, item.id)}>
              <ActionButton className={iconButton} aria-label={`Not interested in ${item.title}`} title="Not interested">
                <X className="size-5" aria-hidden />
              </ActionButton>
            </form>
          )}
        </div>
      </div>
      <Link href={`/explore/${item.slug}`} className="mt-3 block font-bold text-ink hover:text-primary hover:underline">
        {item.title}
      </Link>
      {item.summary && <p className="mt-1 text-sm text-ink-muted">{item.summary}</p>}
      <div className="mt-auto pt-4">
        {reason && (
          <p className="flex items-start gap-1.5 text-xs font-medium text-ink-subtle">
            <Sparkles className="mt-px size-3.5 shrink-0 text-primary" aria-hidden /> {reason}
          </p>
        )}
        {!reason && item.provider && <p className="text-xs text-ink-subtle">From {item.provider}</p>}
      </div>
    </Card>
  );
}
