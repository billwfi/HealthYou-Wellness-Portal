import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { requireUser } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { isJoinable } from "@/lib/challenges";
import { getChallengesForMember } from "@/server/challenge-list";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeCard } from "@/components/challenges/challenge-card";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const user = await requireUser();
  const today = programToday();
  const items = await getChallengesForMember(user.id);

  const mine = items.filter((i) => i.enrollment && isJoinable(i.phase));
  const open = items.filter((i) => !i.enrollment && isJoinable(i.phase));
  const past = items.filter((i) => !isJoinable(i.phase)).reverse();

  const sections = [
    { id: "mine", title: "Your challenges", items: mine },
    { id: "open", title: mine.length ? "More to join" : "Open to join", items: open },
    { id: "past", title: "Past challenges", items: past },
  ].filter((s) => s.items.length);

  return (
    <>
      <PageHeader
        eyebrow="Challenges"
        title="Compete, connect, climb"
        description="Join on your own or with a team. Activity you log on the Progress page counts automatically."
      />
      {sections.length ? (
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={`${s.id}-heading`}>
              <h2 id={`${s.id}-heading`} className="mb-3 text-lg font-bold">
                {s.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((i) => (
                  <ChallengeCard key={i.challenge.id} item={i} today={today} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={Trophy} title="No challenges yet">
            New challenges will show up here as soon as they&apos;re announced.
          </EmptyState>
        </Card>
      )}
    </>
  );
}
