"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { siteOrigin } from "@/server/qr";
import { createWidgetSession, demoConnect, demoSendWeek, disconnectDevice, terraMode } from "@/server/terra";

/** Send the member to Terra's connect page (or the demo picker without credentials). */
export async function startDeviceConnect() {
  const user = await requireUser();
  if (terraMode() === "demo") redirect("/connect/devices/demo");
  let url: string;
  try {
    url = await createWidgetSession(user.id, await siteOrigin());
  } catch (e) {
    console.error(e);
    redirect("/profile?device=unavailable#devices");
  }
  redirect(url);
}

export async function disconnectDeviceAction(connectionId: number) {
  const user = await requireUser();
  try {
    await disconnectDevice(user.id, Number(connectionId));
  } catch (e) {
    console.error(e);
    redirect("/profile?device=disconnect-failed#devices");
  }
  revalidatePath("/profile");
  revalidatePath("/progress");
  redirect("/profile?device=disconnected#devices");
}

export async function demoConnectAction(code: string) {
  const user = await requireUser();
  await demoConnect(user.id, String(code));
  revalidatePath("/profile");
  redirect("/profile?device=connected#devices");
}

export async function demoSendWeekAction(connectionId: number) {
  const user = await requireUser();
  await demoSendWeek(user.id, Number(connectionId));
  revalidatePath("/", "layout");
  redirect("/profile?device=synced#devices");
}
