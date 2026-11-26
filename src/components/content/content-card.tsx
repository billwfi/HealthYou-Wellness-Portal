import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck, CheckCircle2, Sparkles, X } from "lucide-react";
import { dismissContent, toggleSaveContent } from "@/app/(app)/actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { WellnessPath } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { contentTypeMeta } from "./content-meta";
import { contentPhoto } from "@/components/brand/photos";

type Item = { id: number; slug: string; title: string; summary: string | null; type: string; path: string; provider: string | null };

// Colored edge under the photo, per path (static class names so Tailwind can see them).
const EDGE: Record<string, string> = { body: "bg-path-body", life: "bg-path-life", mind: "bg-path-mind" };

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
  const photo = contentPhoto(item);
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link href={`/explore/${item.slug}`} tabIndex={-1} aria-hidden className="relative block h-32 shrink-0 overflow-hidden">
        <Image src={photo.src} alt="" fill placeholder="blur" sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100" style={{ objectPosition: photo.position ?? "center" }} />
      </Link>
      <div className={`h-1 shrink-0 ${EDGE[item.path] ?? "bg-primary"}`} aria-hidden />
      <div className="flex flex-1 flex-col p-5">
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
      </div>
    </Card>
  );
}
