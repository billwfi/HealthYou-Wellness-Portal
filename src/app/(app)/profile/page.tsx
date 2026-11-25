import type { Metadata } from "next";
import { Target } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { getMemberContext } from "@/server/member";
import { WELLNESS_PATHS, type MemberType } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { PageBanner } from "@/components/brand/page-banner";
import { BANNERS } from "@/components/brand/photos";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SignOutButton } from "@/components/shell/sign-out-button";

export const metadata: Metadata = { title: "Profile" };

const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  employee: "City employee",
  spouse: "Spouse or partner",
  retiree: "Retiree",
};

const editLink = (
  <ButtonLink href="/welcome" variant="secondary" size="sm">
    Edit
  </ButtonLink>
);

export default async function ProfilePage() {
  const user = await requireUser();
  const [member, habits] = await Promise.all([
    getMemberContext(user.id),
    db.userHabit.findMany({ where: { userId: user.id, active: true }, include: { habit: true }, orderBy: { startedAt: "asc" } }),
  ]);
  const memberType = member.profile?.memberType as MemberType | undefined;

  return (
    <>
      <PageBanner photo={BANNERS.profile}
        eyebrow="Profile"
        title={user.name}
        description={[user.email, memberType && MEMBER_TYPE_LABELS[memberType], member.profile?.department].filter(Boolean).join(" · ")}
        action={<SignOutButton className="bg-white/15 text-white backdrop-blur hover:bg-white/25 hover:text-white" />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Interests" description="Used to personalize your Today feed" action={editLink} />
          <CardBody className="space-y-4">
            {WELLNESS_PATHS.map((path) => {
              const tags = member.interests.filter((t) => t.path === path);
              return (
                <div key={path}>
                  <Badge tone={path}>{PATHS[path].label}</Badge>
                  {tags.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <li key={t.id} className="rounded-full border border-border px-3 py-1 text-sm font-medium text-ink">
                          {t.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-ink-subtle">None chosen</p>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Goals" action={editLink} />
            <CardBody>
              <ul className="space-y-3">
                {WELLNESS_PATHS.map((path) => (
                  <li key={path} className="flex items-start gap-3">
                    <Badge tone={path} className="mt-0.5 w-14 justify-center">
                      {PATHS[path].label}
                    </Badge>
                    {member.goals[path] ? (
                      <span className="flex items-start gap-1.5 text-sm font-semibold text-ink">
                        <Target className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden /> {member.goals[path]}
                      </span>
                    ) : (
                      <span className="text-sm text-ink-subtle">No goal set</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Daily habits" action={editLink} />
            <CardBody>
              {habits.length ? (
                <ul className="space-y-2">
                  {habits.map(({ habit }) => (
                    <li key={habit.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-ink">{habit.title}</span>
                      <span className="text-ink-muted">+{habit.points} pts/day</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-subtle">No habits chosen</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Connected devices" action={<Badge tone="primary">Coming soon</Badge>} />
            <CardBody className="text-sm text-ink-muted">Apple Health, Health Connect, Fitbit, Garmin and more.</CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
