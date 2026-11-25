import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Plus, Search, Star } from "lucide-react";
import { db } from "@/db";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/session";
import { WELLNESS_PATHS, type WellnessPath } from "@/lib/domain";
import { programToday } from "@/lib/dates";
import { cn, PATHS } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { contentTypeMeta } from "@/components/content/content-meta";

export const metadata: Metadata = { title: "Content" };

const STATUSES = ["all", "published", "draft", "featured"] as const;
type Status = (typeof STATUSES)[number];
type Search = Promise<{ status?: string; path?: string; q?: string; saved?: string; deleted?: string }>;

function chip(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1 text-sm font-semibold transition-colors",
    active ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink",
  );
}

export default async function AdminContentPage({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const sp = await searchParams;
  const status: Status = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : "all";
  const path = WELLNESS_PATHS.includes(sp.path as WellnessPath) ? (sp.path as WellnessPath) : undefined;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const today = programToday();

  const featuredNow: Prisma.ContentItemWhereInput = {
    featuredFrom: { lte: today },
    OR: [{ featuredUntil: null }, { featuredUntil: { gte: today } }],
  };
  const where: Prisma.ContentItemWhereInput = {
    ...(path && { path }),
    ...(q && { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { provider: { contains: q } }] }),
    ...(status === "published" && { publishedAt: { not: null } }),
    ...(status === "draft" && { publishedAt: null }),
    ...(status === "featured" && { AND: [featuredNow] }),
  };

  const [items, counts] = await Promise.all([
    db.contentItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        tags: { include: { tag: { select: { label: true } } } },
        _count: {
          select: {
            interactions: { where: { completedAt: { not: null } } },
          },
        },
      },
    }),
    Promise.all([
      db.contentItem.count(),
      db.contentItem.count({ where: { publishedAt: { not: null } } }),
      db.contentItem.count({ where: { publishedAt: null } }),
      db.contentItem.count({ where: featuredNow }),
    ]),
  ]);
  const savedCounts = await db.contentInteraction.groupBy({
    by: ["contentId"],
    where: { contentId: { in: items.map((i) => i.id) }, savedAt: { not: null } },
    _count: { _all: true },
  });
  const saves = new Map(savedCounts.map((s) => [s.contentId, s._count._all]));
  const countFor: Record<Status, number> = { all: counts[0], published: counts[1], draft: counts[2], featured: counts[3] };

  const href = (next: { status?: Status; path?: WellnessPath | null; q?: string }) => {
    const p = new URLSearchParams();
    const s = next.status ?? status;
    const pa = next.path === null ? undefined : (next.path ?? path);
    const qq = next.q ?? q;
    if (s !== "all") p.set("status", s);
    if (pa) p.set("path", pa);
    if (qq) p.set("q", qq);
    const str = p.toString();
    return str ? `/admin/content?${str}` : "/admin/content";
  };

  const savedItem = sp.saved ? items.find((i) => String(i.id) === sp.saved) : undefined;

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Content"
        description="Articles, programs and resources members see in Explore and their For you feed."
        action={
          <ButtonLink href="/admin/content/new">
            <Plus className="size-4" aria-hidden /> New content
          </ButtonLink>
        }
      />

      {(savedItem || sp.deleted) && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          {savedItem ? `Saved “${savedItem.title}”.` : "Item deleted."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Status" className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Link key={s} href={href({ status: s })} className={chip(status === s)} aria-current={status === s ? "page" : undefined}>
              {s[0].toUpperCase() + s.slice(1)} <span className="opacity-70">{countFor[s]}</span>
            </Link>
          ))}
        </nav>
        <span className="h-6 w-px bg-border" aria-hidden />
        <nav aria-label="Path" className="flex flex-wrap gap-2">
          {WELLNESS_PATHS.map((p) => (
            <Link key={p} href={href({ path: path === p ? null : p })} className={chip(path === p)} aria-current={path === p ? "page" : undefined}>
              {PATHS[p].label}
            </Link>
          ))}
        </nav>
        <form action="/admin/content" className="relative ml-auto w-full sm:w-64">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {path && <input type="hidden" name="path" value={path} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Search title or provider"
            aria-label="Search content"
            className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </form>
      </div>

      <Card className="mt-4 overflow-hidden">
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Title</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Path</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Topics</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Completed</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Saved</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const { label, icon: Icon } = contentTypeMeta(item.type);
                  const p = item.path as WellnessPath;
                  const featured =
                    item.featuredFrom != null && item.featuredFrom <= today && (item.featuredUntil == null || item.featuredUntil >= today);
                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/60">
                      <td className="px-4 py-3">
                        <Link href={`/admin/content/${item.id}`} className="font-semibold text-ink hover:text-primary hover:underline">
                          {item.title}
                        </Link>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                          <Icon className="size-3.5" aria-hidden /> {label}
                          {item.provider && <> · {item.provider}</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={PATHS[p] ? p : "neutral"}>{PATHS[p]?.label ?? item.path}</Badge>
                      </td>
                      <td className="hidden max-w-56 px-4 py-3 text-xs text-ink-muted md:table-cell">
                        {item.tags.length ? item.tags.map((t) => t.tag.label).join(", ") : <span className="text-warning">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap gap-1">
                          {item.publishedAt ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                          {featured && (
                            <Badge tone="warning">
                              <Star className="size-3" aria-hidden /> Featured
                            </Badge>
                          )}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{item._count.interactions}</td>
                      <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{saves.get(item.id) ?? 0}</td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted lg:table-cell">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Denver" }).format(item.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={q || path || status !== "all" ? "No matches" : "No content yet"}
            action={<ButtonLink href="/admin/content/new" variant="secondary">New content</ButtonLink>}
          >
            {q || path || status !== "all" ? "Try a different filter or search." : "Add the first article, program or resource."}
          </EmptyState>
        )}
      </Card>
    </>
  );
}
