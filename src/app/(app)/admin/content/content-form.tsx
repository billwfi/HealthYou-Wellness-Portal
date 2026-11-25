"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type ReactNode } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/auth/field";
import { CONTENT_TYPE_META } from "@/components/content/content-meta";
import { CONTENT_TYPES, WELLNESS_PATHS, type ContentType, type WellnessPath } from "@/lib/domain";
import { slugify } from "@/lib/slug";
import { cn, PATHS } from "@/lib/utils";
import type { ContentFormState } from "./actions";

export type ContentFormValues = {
  title: string;
  slug: string;
  type: ContentType;
  path: WellnessPath;
  provider: string;
  summary: string;
  body: string;
  url: string;
  durationMinutes: string;
  points: string;
  tagIds: number[];
  featuredFrom: string;
  featuredUntil: string;
  published: boolean;
};

type Tag = { id: number; label: string; path: WellnessPath };

const control =
  "block w-full rounded-xl border bg-surface px-3.5 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-accent";

function FieldShell({ id, label, hint, error, children, optional }: { id: string; label: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-ink-subtle">(optional)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-accent">
          {error}
        </p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

const CHOSEN: Record<WellnessPath, string> = {
  body: "peer-checked:border-path-body peer-checked:bg-path-body-soft peer-checked:text-path-body",
  life: "peer-checked:border-path-life peer-checked:bg-path-life-soft peer-checked:text-path-life",
  mind: "peer-checked:border-path-mind peer-checked:bg-path-mind-soft peer-checked:text-path-mind",
};

export function ContentForm({
  action,
  initial,
  tags,
  isNew,
  deleteSlot,
}: {
  action: (prev: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  initial: ContentFormValues;
  tags: Tag[];
  isNew: boolean;
  deleteSlot?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null, fieldErrors: {} });
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  // New items follow the title until the admin edits the web address by hand.
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tagIds, setTagIds] = useState(() => new Set(initial.tagIds));
  const [published, setPublished] = useState(initial.published);
  const fe = state.fieldErrors;

  const err = (k: string) => ({
    "aria-invalid": fe[k] ? true : undefined,
    "aria-describedby": fe[k] ? `${k}-error` : undefined,
  });

  return (
    <form
      // Submit by hand: React resets a form after its `action` runs, which would wipe
      // the admin's input whenever validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
      noValidate
    >
      <div className="space-y-6">
        <Card className="space-y-5 p-5">
          <FieldShell id="title" label="Title" error={fe.title}>
            <input
              id="title"
              name="title"
              value={title}
              maxLength={300}
              required
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={cn(control, "h-11 border-border")}
              {...err("title")}
            />
          </FieldShell>
          <FieldShell id="slug" label="Web address" error={fe.slug} hint={`/explore/${slug || "…"}`}>
            <input
              id="slug"
              name="slug"
              value={slug}
              maxLength={150}
              required
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className={cn(control, "h-11 border-border font-mono text-sm")}
              {...err("slug")}
            />
          </FieldShell>
          <FieldShell id="summary" label="Summary" optional error={fe.summary} hint="One or two sentences shown on cards in the feed.">
            <textarea id="summary" name="summary" defaultValue={initial.summary} rows={2} maxLength={1000} className={cn(control, "border-border py-2.5")} {...err("summary")} />
          </FieldShell>
          <FieldShell id="body" label="Body" optional error={fe.body} hint="Plain text. Blank lines start new paragraphs.">
            <textarea id="body" name="body" defaultValue={initial.body} rows={12} className={cn(control, "border-border py-2.5 leading-relaxed")} {...err("body")} />
          </FieldShell>
        </Card>

        <Card className="p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Topics</legend>
            <p className="text-xs text-ink-muted">Members who chose these interests will see this in their &ldquo;For you&rdquo; feed.</p>
            <div className="mt-4 space-y-4">
              {WELLNESS_PATHS.map((p) => (
                <div key={p}>
                  <Badge tone={p}>{PATHS[p].label}</Badge>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags
                      .filter((t) => t.path === p)
                      .map((t) => (
                        <label key={t.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            name="tag"
                            value={t.id}
                            checked={tagIds.has(t.id)}
                            onChange={() =>
                              setTagIds((s) => {
                                const next = new Set(s);
                                if (next.has(t.id)) next.delete(t.id);
                                else next.add(t.id);
                                return next;
                              })
                            }
                            className="peer sr-only"
                          />
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-surface-muted peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15",
                              CHOSEN[p],
                            )}
                          >
                            {tagIds.has(t.id) && <Check className="size-3.5" aria-hidden />}
                            {t.label}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {tagIds.size === 0 && (
              <p className="mt-4 rounded-xl bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
                Without topics, this only reaches members through Explore or a featured window.
              </p>
            )}
          </fieldset>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Status</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={published === (s === "published")}
                    onChange={() => setPublished(s === "published")}
                    className="peer sr-only"
                  />
                  <span className="block rounded-xl border border-border px-3 py-2 text-center text-sm font-semibold text-ink-muted peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/15">
                    {s === "draft" ? "Draft" : "Published"}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-muted">{published ? "Visible to members." : "Only admins can see drafts."}</p>
          </fieldset>

          <FormError message={state.error} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Saving…" : isNew ? "Create" : "Save changes"}
            </Button>
            <Link href="/admin/content" className={buttonClasses({ variant: "ghost" })}>
              Cancel
            </Link>
          </div>
          {!isNew && initial.published && (
            <Link href={`/explore/${initial.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View as member <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <FieldShell id="type" label="Type" error={fe.type}>
            <select id="type" name="type" defaultValue={initial.type} className={cn(control, "h-11 border-border")} {...err("type")}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CONTENT_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell id="path" label="Path" error={fe.path}>
            <select id="path" name="path" defaultValue={initial.path} className={cn(control, "h-11 border-border")} {...err("path")}>
              {WELLNESS_PATHS.map((p) => (
                <option key={p} value={p}>
                  {PATHS[p].label}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell id="provider" label="Provider" optional error={fe.provider} hint="e.g. UCCS, Profile EAP">
            <input id="provider" name="provider" defaultValue={initial.provider} maxLength={200} className={cn(control, "h-11 border-border")} {...err("provider")} />
          </FieldShell>
          <FieldShell id="url" label="Link" optional error={fe.url} hint="Shown as an Open button.">
            <input id="url" name="url" type="url" defaultValue={initial.url} maxLength={1000} placeholder="https://" className={cn(control, "h-11 border-border")} {...err("url")} />
          </FieldShell>
          <div className="grid grid-cols-2 gap-3">
            <FieldShell id="durationMinutes" label="Minutes" optional error={fe.durationMinutes}>
              <input id="durationMinutes" name="durationMinutes" type="number" min={0} inputMode="numeric" defaultValue={initial.durationMinutes} className={cn(control, "h-11 border-border")} {...err("durationMinutes")} />
            </FieldShell>
            <FieldShell id="points" label="Points" error={fe.points} hint="For completing it. 0 = none.">
              <input id="points" name="points" type="number" min={0} inputMode="numeric" defaultValue={initial.points} className={cn(control, "h-11 border-border")} {...err("points")} />
            </FieldShell>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Featured window</h2>
            <p className="text-xs text-ink-muted">Pins this to the top of every member&rsquo;s feed between these dates. Leave the end blank to keep it featured.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldShell id="featuredFrom" label="From" error={fe.featuredFrom}>
              <input id="featuredFrom" name="featuredFrom" type="date" defaultValue={initial.featuredFrom} className={cn(control, "h-11 border-border")} {...err("featuredFrom")} />
            </FieldShell>
            <FieldShell id="featuredUntil" label="Until" error={fe.featuredUntil}>
              <input id="featuredUntil" name="featuredUntil" type="date" defaultValue={initial.featuredUntil} className={cn(control, "h-11 border-border")} {...err("featuredUntil")} />
            </FieldShell>
          </div>
        </Card>

        {deleteSlot}
      </div>
    </form>
  );
}
