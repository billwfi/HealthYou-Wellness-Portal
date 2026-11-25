import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { ContentForm } from "../content-form";
import { saveContent } from "../actions";
import { getEditorTags } from "../editor-data";

export const metadata: Metadata = { title: "New content" };

export default async function NewContentPage() {
  await requireAdmin();
  const tags = await getEditorTags();
  return (
    <>
      <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Content
      </Link>
      <PageHeader eyebrow="Admin" title="New content" />
      <ContentForm
        action={saveContent.bind(null, null)}
        isNew
        tags={tags}
        initial={{
          title: "",
          slug: "",
          type: "article",
          path: "body",
          provider: "",
          summary: "",
          body: "",
          url: "",
          durationMinutes: "",
          points: "10",
          tagIds: [],
          featuredFrom: "",
          featuredUntil: "",
          published: false,
        }}
      />
    </>
  );
}
