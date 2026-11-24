import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader eyebrow="Progress" title="Your progress" description="Activity, habits, devices and biometric trends in one place." />
      <Card>
        <EmptyState
          icon={LineChart}
          title="Tracking moves here in Phase 2"
          action={<ButtonLink href="/legacy/track/dashboard" variant="secondary">Open current tracker</ButtonLink>}
        >
          Log activity, sync your devices and see your screening results over time.
        </EmptyState>
      </Card>
    </>
  );
}
