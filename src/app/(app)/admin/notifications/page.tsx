import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { control, FieldShell } from "@/components/admin/form-fields";
import { ActionButton } from "@/components/content/action-button";
import { pushConfigured } from "@/server/push";
import { sendAnnouncement } from "./actions";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Admin: Notifications" };

const NOTICES: Record<string, { text: string; ok: boolean }> = {
  invalid: { text: "A notification needs a title and a message.", ok: false },
  "bad-link": { text: "The link must be a page in the app, starting with / (for example /challenges).", ok: false },
  "not-configured": { text: "Push notifications aren't set up on the server yet.", ok: false },
};

const fmt = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Denver" }).format(d);

export default async function AdminNotificationsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await requireAdmin();
  const { notice } = await searchParams;
  const sent = notice?.match(/^sent-(\d+)$/);
  const n = sent ? { text: `Sent to ${Number(sent[1]).toLocaleString()} member${sent[1] === "1" ? "" : "s"}.`, ok: true } : notice ? NOTICES[notice] : undefined;

  const [devices, members, newsMembers, departments, challenges, history] = await Promise.all([
    db.pushSubscription.count(),
    db.pushSubscription.findMany({ select: { userId: true }, distinct: ["userId"] }).then((r) => r.length),
    db.pushSubscription.findMany({ where: { user: { profile: { notifyNews: true } } }, select: { userId: true }, distinct: ["userId"] }).then((r) => r.length),
    db.memberProfile.findMany({ where: { department: { not: null } }, select: { department: true }, distinct: ["department"], orderBy: { department: "asc" } }),
    db.challenge.findMany({ where: { status: { not: "draft" }, endDate: { gte: programToday() } }, select: { id: true, name: true }, orderBy: { startDate: "asc" } }),
    db.pushMessage.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const configured = pushConfigured();

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Notifications"
        description={`${members.toLocaleString()} member${members === 1 ? "" : "s"} on ${devices.toLocaleString()} device${devices === 1 ? "" : "s"} have notifications on; ${newsMembers.toLocaleString()} accept program news.`}
      />
      {n && (
        <Notice className={cn("mb-4 rounded-xl px-4 py-2.5 text-sm font-medium", n.ok ? "bg-success-soft text-success" : "bg-accent-soft text-accent")}>
          {n.text}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Send an announcement" description="Goes to members who turned on notifications and allow program news" />
          <CardBody>
            <form action={sendAnnouncement} className="space-y-4">
              <FieldShell id="title" label="Title" hint="Up to 100 characters; keep it short, phones cut it off.">
                <input id="title" name="title" required maxLength={100} aria-describedby="title-hint" className={cn(control, "h-11")} />
              </FieldShell>
              <FieldShell id="body" label="Message" hint="Up to 300 characters.">
                <textarea id="body" name="body" required maxLength={300} rows={3} aria-describedby="body-hint" className={cn(control, "py-2.5")} />
              </FieldShell>
              <FieldShell id="url" label="Opens" optional hint="A page in the app, for example /challenges or /events. Leave blank for Today.">
                <input id="url" name="url" placeholder="/" maxLength={500} aria-describedby="url-hint" className={cn(control, "h-11")} />
              </FieldShell>
              <FieldShell id="audience" label="Send to">
                <select id="audience" name="audience" defaultValue="all" className={cn(control, "h-11")}>
                  <option value="all">Everyone</option>
                  {departments.length > 0 && (
                    <optgroup label="Department">
                      {departments.map((d) => (
                        <option key={d.department} value={`dept:${d.department}`}>
                          {d.department}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {challenges.length > 0 && (
                    <optgroup label="Challenge participants">
                      {challenges.map((c) => (
                        <option key={c.id} value={`challenge:${c.id}`}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </FieldShell>
              <ActionButton className={buttonClasses()} pendingLabel="Sending…" disabled={!configured}>
                <Send className="size-4" aria-hidden /> Send now
              </ActionButton>
              {!configured && <p className="text-sm text-accent">{NOTICES["not-configured"].text}</p>}
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sent" description="Announcements and the daily reminder runs" />
          {history.length ? (
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {history.map((m) => (
                <li key={m.id} className="px-5 py-3 text-sm">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {m.title} <Badge tone={m.kind === "news" ? "primary" : "neutral"}>{m.kind === "news" ? "News" : "Reminders"}</Badge>
                  </p>
                  <p className="mt-0.5 text-ink-muted">{m.body}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {fmt(m.createdAt)} · {m.recipients.toLocaleString()} member{m.recipients === 1 ? "" : "s"} · {m.delivered.toLocaleString()} device
                    {m.delivered === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <CardBody className="text-sm text-ink-muted">Nothing sent yet.</CardBody>
          )}
        </Card>
      </div>
    </>
  );
}
