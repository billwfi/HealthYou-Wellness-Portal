import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Bell, CalendarDays, FileText, Gift, HeartPulse, Trophy, Users, type LucideIcon } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin" };

function Section({ href, icon: Icon, title, description, stat, soon }: {
  href?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  stat?: string;
  soon?: string;
}) {
  const body = (
    <Card className={`flex h-full flex-col p-5 ${href ? "transition-shadow group-hover:shadow-pop" : "border-dashed"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        {soon && <Badge>{soon}</Badge>}
      </div>
      <h2 className="mt-4 font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      {stat && <p className="mt-3 text-sm font-semibold text-ink">{stat}</p>}
      {href && (
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
          Manage <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      )}
    </Card>
  );
  return href ? (
    <Link href={href} className="group">
      {body}
    </Link>
  ) : (
    body
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const [published, drafts, members, onboarded, upcomingEvents, liveChallenges, pendingRewards, pendingScreenings, pushMembers] = await Promise.all([
    db.contentItem.count({ where: { publishedAt: { not: null } } }),
    db.contentItem.count({ where: { publishedAt: null } }),
    db.user.count(),
    db.memberProfile.count({ where: { onboardedAt: { not: null } } }),
    db.event.count({ where: { eventDate: { gte: programToday() } } }),
    db.challenge.count({ where: { status: { in: ["scheduled", "active"] }, endDate: { gte: programToday() } } }),
    db.rewardRedemption.count({ where: { status: "pending" } }),
    db.biometricScreening.count({ where: { verifiedAt: null } }),
    db.pushSubscription.findMany({ select: { userId: true }, distinct: ["userId"] }).then((r) => r.length),
  ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Program administration" description={`${members} member${members === 1 ? "" : "s"} · ${onboarded} finished onboarding`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Section
          href="/admin/content"
          icon={FileText}
          title="Content"
          description="Articles, programs and resources, their topics and featured windows."
          stat={`${published} published · ${drafts} draft${drafts === 1 ? "" : "s"}`}
        />
        <Section
          href="/admin/events"
          icon={CalendarDays}
          title="Events"
          description="Webinars, workshops and classes on members' Today page."
          stat={`${upcomingEvents} upcoming`}
        />
        <Section
          href="/admin/challenges"
          icon={Trophy}
          title="Challenges"
          description="Build from templates, publish, and finish to award points."
          stat={`${liveChallenges} live or upcoming`}
        />
        <Section
          href="/admin/rewards"
          icon={Gift}
          title="Points & rewards"
          description="Reward requests, tiers, earning rules and point adjustments."
          stat={`${pendingRewards} request${pendingRewards === 1 ? "" : "s"} waiting`}
        />
        <Section
          href="/admin/screenings"
          icon={HeartPulse}
          title="Screenings"
          description="Import biometric results and verify self-reported screenings."
          stat={`${pendingScreenings} awaiting review`}
        />
        <Section
          href="/admin/notifications"
          icon={Bell}
          title="Notifications"
          description="Send announcements to phones and browsers; see the daily reminder runs."
          stat={`${pushMembers} member${pushMembers === 1 ? "" : "s"} with notifications on`}
        />
        <Section icon={Users} title="Members" description="Roles, member types and departments." soon="Later" />
        <Section href="/admin/reports" icon={BarChart3} title="Reports" description="De-identified participation, challenge and health reports for the City, with CSV downloads." />
      </div>
    </>
  );
}
