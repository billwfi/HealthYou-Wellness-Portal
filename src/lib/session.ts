import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Session for the current request (deduplicated per render). */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Authoritative check for pages/actions; proxy.ts only does an optimistic cookie check. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
