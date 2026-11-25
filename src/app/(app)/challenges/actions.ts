"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { programToday } from "@/lib/dates";
import { challengePhase, isEligible, isJoinable, parseEligibility } from "@/lib/challenges";
import { recomputeProgress } from "@/server/challenges";
import { audit } from "@/server/audit";

// Errors come back as ?error=<code> so these forms work without client JavaScript.
type JoinError = "closed" | "not-eligible" | "team-required" | "solo-only" | "team-name" | "team-taken" | "team-full" | "team-missing";

function back(slug: string, error?: JoinError): never {
  redirect(`/challenges/${slug}${error ? `?error=${error}#join` : ""}`);
}

export async function joinChallenge(challengeId: number, formData: FormData) {
  const user = await requireUser();
  const c = await db.challenge.findUnique({ where: { id: Number(challengeId) } });
  if (!c) redirect("/challenges");
  const today = programToday();
  if (!isJoinable(challengePhase(c, today))) back(c.slug, "closed");
  const profile = await db.memberProfile.findUnique({ where: { userId: user.id }, select: { memberType: true, department: true } });
  if (!isEligible(parseEligibility(c.eligibility), profile ?? {})) back(c.slug, "not-eligible");

  const mode = String(formData.get("mode") ?? "solo");
  let teamId: number | null = null;
  let newTeam: { name: string; department: string | null } | null = null;

  if (mode === "solo") {
    if (c.teamMode === "team") back(c.slug, "team-required");
  } else {
    if (c.teamMode === "individual") back(c.slug, "solo-only");
    if (mode === "create") {
      const name = String(formData.get("teamName") ?? "").trim().replace(/\s+/g, " ");
      if (name.length < 2 || name.length > 60) back(c.slug, "team-name");
      const taken = await db.team.findFirst({ where: { challengeId: c.id, name }, select: { id: true } });
      if (taken) back(c.slug, "team-taken");
      newTeam = { name, department: profile?.department ?? null };
    } else {
      const team = await db.team.findFirst({
        where: { id: Number(formData.get("teamId")), challengeId: c.id },
        include: { _count: { select: { enrollments: true } } },
      });
      if (!team) back(c.slug, "team-missing");
      if (c.maxTeamSize && team._count.enrollments >= c.maxTeamSize) back(c.slug, "team-full");
      teamId = team.id;
    }
  }

  try {
    await db.$transaction(async (tx) => {
      // A new team and its first member are created together, so a failed join leaves no empty team.
      if (newTeam) teamId = (await tx.team.create({ data: { challengeId: c.id, captainId: user.id, ...newTeam } })).id;
      await tx.challengeEnrollment.create({ data: { challengeId: c.id, userId: user.id, teamId } });
      if (teamId) await tx.teamMember.create({ data: { teamId, userId: user.id } });
    });
  } catch (e) {
    // Already joined (double submit): fall through to the page.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  // Activity logged since the start counts, even if you join late.
  if (c.startDate <= today) await recomputeProgress(user.id, c.startDate, today < c.endDate ? today : c.endDate);

  revalidatePath("/", "layout");
  back(c.slug);
}

export async function leaveChallenge(challengeId: number) {
  const user = await requireUser();
  const enrollment = await db.challengeEnrollment.findUnique({
    where: { challengeId_userId: { challengeId: Number(challengeId), userId: user.id } },
    include: { challenge: { select: { slug: true } }, team: { include: { enrollments: { select: { userId: true } } } } },
  });
  if (!enrollment) redirect("/challenges");
  const team = enrollment.team;
  const others = team?.enrollments.filter((e) => e.userId !== user.id) ?? [];

  // Points already earned are kept.
  await db.$transaction([
    db.challengeProgressDaily.deleteMany({ where: { challengeId: enrollment.challengeId, userId: user.id } }),
    db.challengeEnrollment.delete({ where: { challengeId_userId: { challengeId: enrollment.challengeId, userId: user.id } } }),
    ...(team
      ? [
          db.teamMember.deleteMany({ where: { teamId: team.id, userId: user.id } }),
          others.length === 0
            ? db.team.delete({ where: { id: team.id } })
            : db.team.update({ where: { id: team.id }, data: team.captainId === user.id ? { captainId: others[0].userId } : {} }),
        ]
      : []),
  ]);

  revalidatePath("/", "layout");
  redirect(`/challenges/${enrollment.challenge.slug}`);
}

// ── Team captain tools ───────────────────────────────────────────────────────
// The captain (or an admin) can rename the team, hand over the captaincy and
// remove members. Changes stop once the challenge is finished or archived.

async function captainOf(teamId: number) {
  const user = await requireUser();
  const team = await db.team.findUnique({
    where: { id: Number(teamId) },
    include: { challenge: { select: { id: true, slug: true, status: true, teamMode: true, startDate: true, endDate: true } } },
  });
  if (!team?.challenge) redirect("/challenges");
  const c = team.challenge;
  if (team.captainId !== user.id && user.role !== "admin") back(c.slug);
  if (c.status === "completed" || c.status === "archived") back(c.slug);
  return { user, team, challenge: c };
}

function backToTeam(slug: string, notice?: string): never {
  redirect(`/challenges/${slug}${notice ? `?team-notice=${notice}` : ""}#team`);
}

export async function renameTeam(teamId: number, formData: FormData) {
  const { user, team, challenge } = await captainOf(teamId);
  const name = String(formData.get("teamName") ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) backToTeam(challenge.slug, "name-invalid");
  if (name !== team.name) {
    const taken = await db.team.findFirst({ where: { challengeId: challenge.id, name, id: { not: team.id } }, select: { id: true } });
    if (taken) backToTeam(challenge.slug, "name-taken");
    await db.team.update({ where: { id: team.id }, data: { name } });
    await audit(user.id, "team.rename", "team", team.id, { from: team.name, to: name });
  }
  revalidatePath("/", "layout");
  backToTeam(challenge.slug, "renamed");
}

export async function makeCaptain(teamId: number, memberId: string) {
  const { user, team, challenge } = await captainOf(teamId);
  const member = await db.challengeEnrollment.findFirst({ where: { challengeId: challenge.id, teamId: team.id, userId: memberId } });
  if (!member) backToTeam(challenge.slug);
  await db.team.update({ where: { id: team.id }, data: { captainId: memberId } });
  await audit(user.id, "team.captain", "team", team.id, { from: team.captainId, to: memberId });
  revalidatePath("/", "layout");
  backToTeam(challenge.slug, "captain");
}

/**
 * Take a member off the team. In solo-or-team challenges they carry on solo with
 * their progress; in team-only challenges they leave the challenge. Points stay.
 */
export async function removeTeamMember(teamId: number, memberId: string) {
  const { user, team, challenge } = await captainOf(teamId);
  if (memberId === team.captainId) backToTeam(challenge.slug, "captain-stays");
  const member = await db.challengeEnrollment.findFirst({ where: { challengeId: challenge.id, teamId: team.id, userId: memberId } });
  if (!member) backToTeam(challenge.slug);

  const key = { challengeId_userId: { challengeId: challenge.id, userId: memberId } };
  await db.$transaction([
    db.teamMember.deleteMany({ where: { teamId: team.id, userId: memberId } }),
    ...(challenge.teamMode === "team"
      ? [
          db.challengeProgressDaily.deleteMany({ where: { challengeId: challenge.id, userId: memberId } }),
          db.challengeEnrollment.delete({ where: key }),
        ]
      : [db.challengeEnrollment.update({ where: key, data: { teamId: null } })]),
  ]);
  await audit(user.id, "team.remove_member", "team", team.id, { member: memberId });
  revalidatePath("/", "layout");
  backToTeam(challenge.slug, "removed");
}
