import "server-only";
import { db } from "@/db";
import { programToday } from "@/lib/dates";
import { challengePhase, type ChallengePhase } from "@/lib/challenges";
import { getMemberSummary, type MemberSummary } from "./challenges";

export type ChallengeListItem = Awaited<ReturnType<typeof getChallengesForMember>>[number];

/** Published challenges with the member's enrollment and standing. */
export async function getChallengesForMember(userId: string, { enrolledOnly = false } = {}) {
  const today = programToday();
  const challenges = await db.challenge.findMany({
    where: {
      status: { notIn: ["draft", "archived"] },
      ...(enrolledOnly && { enrollments: { some: { userId } } }),
    },
    include: {
      enrollments: { where: { userId }, include: { team: { select: { name: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ startDate: "asc" }],
  });

  return Promise.all(
    challenges.map(async (c) => {
      const enrollment = c.enrollments[0] ?? null;
      const phase: ChallengePhase = challengePhase(c, today);
      const summary: MemberSummary | null = enrollment ? await getMemberSummary(userId, c) : null;
      return { challenge: c, phase, enrollment, summary, participants: c._count.enrollments };
    }),
  );
}
