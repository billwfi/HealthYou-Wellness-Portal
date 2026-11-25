import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import type { ContentType, WellnessPath } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { ContentForm } from "../content-form";
import { DeleteContentButton } from "../delete-button";
import { saveContent } from "../actions";
import { dayInput, getEditorTags } from "../editor-data";

export const metadata: Metadata = { title: "Edit content" };

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [item, tags, interactions] = await Promise.all([
    db.contentItem.findUnique({ where: { id }, include: { tags: { select: { tagId: true } } } }),
    getEditorTags(),
    db.contentInteraction.count({ where: { contentId: id, OR: [{ savedAt: { not: null } }, { completedAt: { not: null } }] } }),
  ]);
  if (!item) notFound();

  return (
    <>
      <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Content
      </Link>
      <PageHeader eyebrow="Edit content" title={item.title} />
      <ContentForm
        action={saveContent.bind(null, item.id)}
        isNew={false}
        tags={tags}
        initial={{
          title: item.title,
          slug: item.slug,
          type: item.type as ContentType,
          path: item.path as WellnessPath,
          provider: item.provider ?? "",
          summary: item.summary ?? "",
          body: item.body ?? "",
          url: item.url ?? "",
          durationMinutes: item.durationMinutes?.toString() ?? "",
          points: item.points.toString(),
          tagIds: item.tags.map((t) => t.tagId),
          featuredFrom: dayInput(item.featuredFrom),
          featuredUntil: dayInput(item.featuredUntil),
          published: item.publishedAt != null,
        }}
        deleteSlot={<DeleteContentButton id={item.id} title={item.title} interactions={interactions} />}
      />
    </>
  );
}
