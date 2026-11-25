import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import type { WellnessPath } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { completeContent, toggleSaveContent } from "../../actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { ActionButton } from "@/components/content/action-button";
import { contentTypeMeta } from "@/components/content/content-meta";
import { contentPhoto } from "@/components/brand/photos";

type Params = Promise<{ slug: string }>;

async function getItem(slug: string) {
  return db.contentItem.findFirst({
    where: { slug, publishedAt: { not: null } },
    include: { tags: { include: { tag: true }, orderBy: { tag: { sortOrder: "asc" } } } },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const item = await getItem((await params).slug);
  return { title: item?.title ?? "Not found" };
}

export default async function ContentPage({ params }: { params: Params }) {
  const user = await requireUser();
  const item = await getItem((await params).slug);
  if (!item) notFound();

  const interaction = await db.contentInteraction.findUnique({ where: { userId_contentId: { userId: user.id, contentId: item.id } } });
  const path = item.path as WellnessPath;
  const { label, icon: Icon } = contentTypeMeta(item.type);
  const saved = Boolean(interaction?.savedAt);
  const completed = Boolean(interaction?.completedAt);
  const photo = contentPhoto(item);

  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/explore?path=${path}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> {PATHS[path]?.label ?? "Explore"}
      </Link>

      <div className="relative mt-4 h-48 overflow-hidden rounded-3xl shadow-card sm:h-64">
        <Image src={photo.src} alt={photo.alt} fill priority placeholder="blur" sizes="(min-width: 768px) 768px, 100vw" className="object-cover" style={{ objectPosition: photo.position ?? "center" }} />
        <div className="peak-stripe absolute inset-x-0 bottom-0 h-1.5" aria-hidden />
      </div>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={path}>{PATHS[path]?.label ?? path}</Badge>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted">
            <Icon className="size-4" aria-hidden /> {label}
          </span>
          {item.durationMinutes && (
            <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
              <Clock className="size-4" aria-hidden /> {item.durationMinutes} min
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{item.title}</h1>
        {item.provider && <p className="mt-1 text-ink-muted">From {item.provider}</p>}
        {item.summary && <p className="mt-4 text-lg text-ink">{item.summary}</p>}
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {item.url && /^https?:\/\//i.test(item.url) && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "secondary" })}>
            Open <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        <form action={toggleSaveContent.bind(null, item.id)}>
          <ActionButton className={buttonClasses({ variant: "secondary" })} aria-pressed={saved}>
            {saved ? <BookmarkCheck className="size-4 text-primary" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
            {saved ? "Saved" : "Save"}
          </ActionButton>
        </form>
        {completed ? (
          <Badge tone="success" className="h-10 px-4 text-sm">
            <CheckCircle2 className="size-4" aria-hidden /> Completed
          </Badge>
        ) : (
          <form action={completeContent.bind(null, item.id)}>
            <ActionButton className={buttonClasses()} pendingLabel="Saving…">
              <CheckCircle2 className="size-4" aria-hidden /> Mark complete{item.points > 0 ? ` · +${item.points} pts` : ""}
            </ActionButton>
          </form>
        )}
      </div>

      {item.body && (
        <Card className="mt-8 p-6">
          <div className="space-y-4 whitespace-pre-line leading-relaxed text-ink">{item.body}</div>
        </Card>
      )}

      {item.tags.length > 0 && (
        <footer className="mt-8">
          <h2 className="text-sm font-bold text-ink-muted">Topics</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {item.tags.map(({ tag }) => (
              <li key={tag.id}>
                <Link
                  href={`/explore?path=${tag.path}&tag=${tag.slug}`}
                  className="inline-flex rounded-full border border-border px-3 py-1 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                >
                  {tag.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
