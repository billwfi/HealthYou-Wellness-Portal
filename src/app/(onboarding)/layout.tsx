import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { SkipLink } from "@/components/shell/skip-link";
import { requireUser } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-dvh">
      <SkipLink />
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-8">
        <Link href="/" aria-label="Reach Your Peak home">
          <Logo />
        </Link>
        <SignOutButton />
      </header>
      <main id="main" tabIndex={-1} className="focus:outline-none mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
