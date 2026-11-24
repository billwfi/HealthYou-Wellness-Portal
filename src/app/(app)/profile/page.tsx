import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/shell/sign-out-button";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Profile" title={user.name} description={user.email} action={<SignOutButton />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Interests & goals" action={<Badge tone="primary">Phase 1</Badge>} />
          <CardBody className="text-sm text-ink-muted">
            Choose the Body, Life and Mind topics you care about. We use them to personalize your Today feed.
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Connected devices" action={<Badge tone="primary">Phase 4</Badge>} />
          <CardBody className="text-sm text-ink-muted">Apple Health, Health Connect, Fitbit, Garmin and more.</CardBody>
        </Card>
      </div>
    </>
  );
}
