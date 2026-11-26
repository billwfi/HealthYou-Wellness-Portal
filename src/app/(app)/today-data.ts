import type { getPointsSummary } from "@/server/points";
import type { getRecommendations } from "@/server/recommendations";
import type { getTodayHabits } from "@/server/habits";
import type { getMemberContext } from "@/server/member";
import type { getUpcomingEvents } from "@/server/events";
import type { getChallengesForMember } from "@/server/challenge-list";

type Awaited2<T extends (...a: never[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

export type TodayData = {
  firstName: string;
  planYear: number;
  total: number;
  nextTier: Awaited2<typeof getPointsSummary>["nextTier"];
  picks: Awaited2<typeof getRecommendations>;
  habits: Awaited2<typeof getTodayHabits>;
  member: Pick<Awaited2<typeof getMemberContext>, "goals">;
  events: Awaited2<typeof getUpcomingEvents>;
  challengeItems: Awaited2<typeof getChallengesForMember>;
  now: Date;
  today: Date;
};
