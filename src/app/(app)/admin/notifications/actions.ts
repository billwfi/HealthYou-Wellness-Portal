"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { audit } from "@/server/audit";
import { notify, pushConfigured } from "@/server/push";

function done(notice: string): never {
  revalidatePath("/admin/notifications");
  redirect(`/admin/notifications?notice=${notice}`);
}

/** Program news to everyone, one department, or one challenge's participants (members who allow news). */
export async function sendAnnouncement(formData: FormData) {
  const admin = await requireAdmin();
  if (!pushConfigured()) done("not-configured");
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  const body = String(formData.get("body") ?? "").trim().slice(0, 300);
  const link = String(formData.get("url") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");
  if (!title || !body) done("invalid");
  // Only links inside the app: notifications open in the installed app.
  const url = link === "" ? "/" : link.startsWith("/") && !link.startsWith("//") ? link.slice(0, 500) : null;
  if (url == null) done("bad-link");

  let userIds: string[];
  let who: Record<string, unknown>;
  if (audience.startsWith("dept:")) {
    const department = audience.slice(5);
    userIds = (await db.memberProfile.findMany({ where: { department }, select: { userId: true } })).map((p) => p.userId);
    who = { department };
  } else if (audience.startsWith("challenge:")) {
    const challengeId = Number(audience.slice(10));
    userIds = (await db.challengeEnrollment.findMany({ where: { challengeId }, select: { userId: true } })).map((e) => e.userId);
    who = { challengeId };
  } else {
    userIds = (await db.pushSubscription.findMany({ select: { userId: true }, distinct: ["userId"] })).map((s) => s.userId);
    who = { all: true };
  }

  const { recipients, delivered } = await notify(userIds, { title, body, url, tag: "news" }, "news");
  const row = await db.pushMessage.create({
    data: { kind: "news", title, body, url, audience: JSON.stringify(who), sentBy: admin.id, recipients, delivered },
  });
  await audit(admin.id, "push.announce", "push_message", row.id, { ...who, recipients, delivered });
  done(`sent-${recipients}`);
}
