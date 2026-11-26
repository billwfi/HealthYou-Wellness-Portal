import "server-only";
import { db } from "@/db";
import { programToday } from "@/lib/dates";
import { challengePhase, isEligible, parseEligibility, type ChallengePhase } from "@/lib/challenges";
import { getMemberSummary, type MemberSummary } from "./challenges";

export type ChallengeListItem = Awaited<ReturnType<typeof getChallengesForMember>>[number];

/** Published challenges the member can see (eligible, or already in), with their enrollment and standing. */
export async function getChallengesForMember(userId: string, { enrolledOnly = false } = {}) {
  const today = programToday();
  const profile = await db.memberProfile.findUnique({ where: { userId }, select: { memberType: true, department: true } });
  const all = await db.challenge.findMany({
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

  const challenges = all.filter((c) => c.enrollments.length > 0 || isEligible(parseEligibility(c.eligibility), profile ?? {}));

  return Promise.all(
    challenges.map(async (c) => {
      const enrollment = c.enrollments[0] ?? null;
      const phase: ChallengePhase = challengePhase(c, today);
      const summary: MemberSummary | null = enrollment ? await getMemberSummary(userId, c) : null;
      return { challenge: c, phase, enrollment, summary, participants: c._count.enrollments };
    }),
  );
}
