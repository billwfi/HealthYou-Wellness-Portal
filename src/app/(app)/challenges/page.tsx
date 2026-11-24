import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Challenges" };

export default function ChallengesPage() {
  return (
    <>
      <PageHeader eyebrow="Challenges" title="Compete, connect, climb" description="Individual and team challenges with live leaderboards." />
      <Card>
        <EmptyState
          icon={Trophy}
          title="The new challenge experience arrives in Phase 2"
          action={<ButtonLink href="/legacy/challenges" variant="secondary">View current challenges</ButtonLink>}
        >
          Leaderboard, target, streak and virtual-race challenges — with teams ranked by average per member so every department has a fair shot.
        </EmptyState>
      </Card>
    </>
  );
}
