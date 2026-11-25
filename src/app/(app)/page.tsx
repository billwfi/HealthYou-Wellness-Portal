import { requireUser } from "@/lib/session";
import { getPointsSummary } from "@/server/points";
import { getRecommendations } from "@/server/recommendations";
import { getTodayHabits } from "@/server/habits";
import { getMemberContext } from "@/server/member";
import { getUpcomingEvents } from "@/server/events";
import { getChallengesForMember } from "@/server/challenge-list";
import { currentPlanYear } from "@/lib/utils";
import { programToday } from "@/lib/dates";
import { TodayView } from "./today-view";

export default async function TodayPage() {
  const user = await requireUser();
  const planYear = currentPlanYear();
  const [{ total, nextTier }, picks, habits, member, events, challengeItems] = await Promise.all([
    getPointsSummary(user.id, planYear),
    getRecommendations(user.id, { limit: 4 }),
    getTodayHabits(user.id),
    getMemberContext(user.id),
    getUpcomingEvents({ limit: 3 }),
    getChallengesForMember(user.id),
  ]);
  const now = new Date();
  return (
    <TodayView
      data={{
        firstName: user.firstName || user.name.split(" ")[0],
        planYear,
        total,
        nextTier,
        picks,
        habits,
        member,
        events,
        challengeItems,
        now,
        today: programToday(now),
      }}
    />
  );
}
