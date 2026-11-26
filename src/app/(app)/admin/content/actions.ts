"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/session";
import { CONTENT_TYPES, WELLNESS_PATHS } from "@/lib/domain";
import { dateOnly } from "@/lib/dates";
import { SLUG_PATTERN } from "@/lib/slug";
import { audit } from "@/server/audit";

export type ContentFormState = { error: string | null; fieldErrors: Partial<Record<string, string>> };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max.toLocaleString()} characters.`)
    .transform((s) => s || null);

const optionalInt = (max: number) =>
  z
    .string()
    .trim()
    .transform((s) => (s === "" ? null : Number(s)))
    .pipe(z.number().int("Use a whole number.").min(0, "Can't be negative.").max(max, `At most ${max}.`).nullable());

const optionalDay = z
  .string()
  .trim()
  .refine((s) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s), "Use a valid date.")
  .transform((s) => (s ? dateOnly(s) : null));

const ContentInput = z
  .object({
    title: z.string().trim().min(1, "Add a title.").max(300, "Keep the title under 300 characters."),
    slug: z.string().trim().toLowerCase().min(1, "Add a web address.").max(150).regex(SLUG_PATTERN, "Use lowercase letters, numbers and dashes."),
    type: z.enum(CONTENT_TYPES, { error: "Choose a type." }),
    path: z.enum(WELLNESS_PATHS, { error: "Choose a path." }),
    provider: optionalText(200),
    summary: optionalText(1000),
    body: optionalText(100_000),
    url: optionalText(1000).refine((u) => u == null || /^https?:\/\/\S+$/i.test(u), "Links must start with http:// or https://"),
    durationMinutes: optionalInt(10_000),
    points: optionalInt(1000).transform((n) => n ?? 0),
    tagIds: z.array(z.coerce.number().int().positive()),
    featuredFrom: optionalDay,
    featuredUntil: optionalDay,
    published: z.boolean(),
  })
  .refine((v) => !v.featuredUntil || v.featuredFrom, { message: "Add a start date for the featured window.", path: ["featuredFrom"] })
  .refine((v) => !v.featuredFrom || !v.featuredUntil || v.featuredUntil >= v.featuredFrom, {
    message: "The end date must be on or after the start date.",
    path: ["featuredUntil"],
  });

function refreshMemberPages() {
  revalidatePath("/", "layout");
}

export async function saveContent(id: number | null, _prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const admin = await requireAdmin();
  const text = (k: string) => String(formData.get(k) ?? "");
  const parsed = ContentInput.safeParse({
    title: text("title"),
    slug: text("slug"),
    type: text("type"),
    path: text("path"),
    provider: text("provider"),
    summary: text("summary"),
    body: text("body"),
    url: text("url"),
    durationMinutes: text("durationMinutes"),
    points: text("points"),
    tagIds: formData.getAll("tag"),
    featuredFrom: text("featuredFrom"),
    featuredUntil: text("featuredUntil"),
    published: formData.get("status") === "published",
  });
  if (!parsed.success) {
    const fieldErrors: ContentFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const { tagIds, published, ...fields } = parsed.data;

  const existing = id == null ? null : await db.contentItem.findUnique({ where: { id }, select: { id: true, publishedAt: true } });
  if (id != null && !existing) return { error: "This item no longer exists.", fieldErrors: {} };

  const validTags = await db.tag.findMany({ where: { id: { in: tagIds } }, select: { id: true } });
  const publishedAt = published ? (existing?.publishedAt ?? new Date()) : null;

  let savedId: number;
  try {
    savedId = await db.$transaction(async (tx) => {
      const row = existing
        ? await tx.contentItem.update({ where: { id: existing.id }, data: { ...fields, publishedAt } })
        : await tx.contentItem.create({ data: { ...fields, publishedAt } });
      await tx.contentTag.deleteMany({ where: { contentId: row.id } });
      if (validTags.length) {
        await tx.contentTag.createMany({ data: validTags.map((t) => ({ contentId: row.id, tagId: t.id })) });
      }
      const action = !existing ? "content.create" : "content.update";
      const statusChange =
        existing && Boolean(existing.publishedAt) !== published ? (published ? "published" : "unpublished") : undefined;
      await audit(admin.id, action, "content_item", row.id, { slug: row.slug, title: row.title, statusChange }, tx);
      return row.id;
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Please fix the highlighted fields.", fieldErrors: { slug: "Another item already uses this web address." } };
    }
    throw e;
  }

  refreshMemberPages();
  redirect(`/admin/content?saved=${savedId}`);
}

export async function deleteContent(id: number) {
  const admin = await requireAdmin();
  const item = await db.contentItem.findUnique({ where: { id }, select: { id: true, slug: true, title: true } });
  if (!item) redirect("/admin/content");
  // Points already earned stay in the ledger; tags and member saves go with the item.
  await db.$transaction(async (tx) => {
    await tx.contentItem.delete({ where: { id: item.id } });
    await audit(admin.id, "content.delete", "content_item", item.id, { slug: item.slug, title: item.title }, tx);
  });
  refreshMemberPages();
  redirect("/admin/content?deleted=1");
}
