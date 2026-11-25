import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { requireUser } from "@/lib/session";
import { getMemberContext } from "@/server/member";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { onboarded } = await getMemberContext(user.id);
  if (!onboarded) redirect("/welcome");
  return <AppShell user={user}>{children}</AppShell>;
}
