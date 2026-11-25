import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bookmark, SearchX } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { getMemberContext } from "@/server/member";
import { WELLNESS_PATHS, type WellnessPath } from "@/lib/domain";
import { cn, PATHS } from "@/lib/utils";
import { PageBanner } from "@/components/brand/page-banner";
import { BANNERS, PATH_PHOTOS } from "@/components/brand/photos";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ContentCard } from "@/components/content/content-card";

export const metadata: Metadata = { title: "Explore" };

type Search = Promise<{ path?: string; tag?: string; saved?: string }>;

const LEGACY_LINKS = [
  { label: "Health coaching", href: "/legacy/body/health-coaching" },
  { label: "Biometric screening", href: "/legacy/body/biometric-screening" },
  { label: "UCCS programs", href: "/legacy/body/uccs-programs" },
  { label: "Food & Mood resources", href: "/legacy/body/food-mood-resources" },
];

function chipClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
    active ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
  );
}

function href(params: { path?: string; tag?: string; saved?: boolean }) {
  const q = new URLSearchParams();
  if (params.path) q.set("path", params.path);
  if (params.tag) q.set("tag", params.tag);
  if (params.saved) q.set("saved", "1");
  const s = q.toString();
  return s ? `/explore?${s}` : "/explore";
}

export default async function ExplorePage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  const sp = await searchParams;
  const path = WELLNESS_PATHS.includes(sp.path as WellnessPath) ? (sp.path as WellnessPath) : undefined;
  const savedOnly = sp.saved === "1";

  const [member, tags, items] = await Promise.all([
    getMemberContext(user.id),
    db.tag.findMany({ where: path ? { path } : undefined, orderBy: [{ path: "asc" }, { sortOrder: "asc" }] }),
    db.contentItem.findMany({
      where: {
        publishedAt: { not: null },
        ...(path && { path }),
        ...(sp.tag && { tags: { some: { tag: { slug: sp.tag } } } }),
        ...(savedOnly && { interactions: { some: { userId: user.id, savedAt: { not: null } } } }),
      },
      include: { tags: { include: { tag: true } }, interactions: { where: { userId: user.id } } },
      orderBy: [{ path: "asc" }, { title: "asc" }],
    }),
  ]);
  const tag = tags.find((t) => t.slug === sp.tag);
  const interestIds = new Set(member.interests.map((t) => t.id));

  return (
    <>
      <PageBanner photo={path ? PATH_PHOTOS[path] : BANNERS.explore}
        eyebrow="Explore"
        title={path ? `${PATHS[path].label}` : "Body, Life & Mind"}
        description={path ? PATHS[path].tagline : "Programs, coaching and resources across the three Reach Your Peak paths."}
      />

      <nav aria-label="Filter by path" className="flex flex-wrap gap-2">
        <Link href={href({ saved: savedOnly })} className={chipClass(!path)} aria-current={!path ? "page" : undefined}>
          All
        </Link>
        {WELLNESS_PATHS.map((p) => (
          <Link key={p} href={href({ path: p, saved: savedOnly })} className={chipClass(path === p)} aria-current={path === p ? "page" : undefined}>
            {PATHS[p].label}
          </Link>
        ))}
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <Link href={href({ path, tag: sp.tag, saved: !savedOnly })} className={chipClass(savedOnly)} aria-current={savedOnly ? "page" : undefined}>
          <Bookmark className="size-4" aria-hidden /> Saved
        </Link>
      </nav>

      <nav aria-label="Filter by topic" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {tags.map((t) => {
          const active = t.slug === sp.tag;
          return (
            <Link
              key={t.id}
              href={href({ path, tag: active ? undefined : t.slug, saved: savedOnly })}
              className={cn("font-medium hover:text-primary", active ? "text-primary underline underline-offset-4" : "text-ink-muted")}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
              {interestIds.has(t.id) && <span className="sr-only"> (one of your interests)</span>}
              {interestIds.has(t.id) && <span className="ml-1 text-primary" aria-hidden>•</span>}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 mb-3 text-sm text-ink-muted" aria-live="polite">
        {items.length} {items.length === 1 ? "item" : "items"}
        {tag && ` in ${tag.label}`}
        {savedOnly && " saved"}
      </p>

      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const match = item.tags.find((ct) => interestIds.has(ct.tagId));
            const i = item.interactions[0];
            return (
              <ContentCard
                key={item.id}
                item={item}
                reason={match ? `Matches your interest in ${match.tag.label}` : undefined}
                saved={Boolean(i?.savedAt)}
                completed={Boolean(i?.completedAt)}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={SearchX}
            title={savedOnly ? "Nothing saved here yet" : "Nothing here yet"}
            action={
              <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
                Clear filters
              </Link>
            }
          >
            {savedOnly ? "Tap the bookmark on anything you want to come back to." : "Try another path or topic."}
          </EmptyState>
        </Card>
      )}

      <section className="mt-10" aria-labelledby="legacy-heading">
        <h2 id="legacy-heading" className="text-sm font-bold text-ink-muted">
          From the original site
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {LEGACY_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
                {l.label} <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
