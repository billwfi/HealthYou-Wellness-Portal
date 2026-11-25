import type { Metadata } from "next";
import Image from "next/image";
import { BANNERS } from "@/components/brand/photos";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { getMemberContext } from "@/server/member";
import { WELLNESS_PATHS, type MemberType, type WellnessPath } from "@/lib/domain";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const user = await requireUser();
  const [member, tags, habits, userHabits] = await Promise.all([
    getMemberContext(user.id),
    db.tag.findMany({ orderBy: [{ path: "asc" }, { sortOrder: "asc" }], select: { id: true, label: true, path: true } }),
    db.habit.findMany({ where: { isActive: true }, orderBy: { id: "asc" }, select: { id: true, title: true, path: true, tagId: true, points: true } }),
    db.userHabit.findMany({ where: { userId: user.id, active: true }, select: { habitId: true } }),
  ]);

  const goals = Object.fromEntries(WELLNESS_PATHS.map((p) => [p, member.goals[p] ?? ""])) as Record<WellnessPath, string>;

  return (
    <>
      <div className="relative mb-8 h-36 overflow-hidden rounded-3xl shadow-card sm:h-44">
        <Image src={BANNERS.welcome.src} alt="" fill priority placeholder="blur" sizes="(min-width: 768px) 768px, 100vw" className="object-cover" style={{ objectPosition: BANNERS.welcome.position }} />
        <div className="peak-stripe absolute inset-x-0 bottom-0 h-1.5" aria-hidden />
      </div>
      <OnboardingForm
      firstName={user.firstName || user.name.split(" ")[0]}
      editing={member.onboarded}
      tags={tags.map((t) => ({ ...t, path: t.path as WellnessPath }))}
      habits={habits.map((h) => ({ ...h, path: h.path as WellnessPath }))}
      initial={{
        memberType: (member.profile?.memberType as MemberType | undefined) ?? "employee",
        department: member.profile?.department ?? "",
        tagIds: member.interests.map((t) => t.id),
        goals,
        habitIds: userHabits.map((h) => h.habitId),
      }}
    />
    </>
  );
}
