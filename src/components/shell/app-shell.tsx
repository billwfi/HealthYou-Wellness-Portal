import Link from "next/link";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { BottomNav, SidebarNav } from "./nav-links";
import { SignOutButton } from "./sign-out-button";
import { SkipLink } from "./skip-link";

type ShellUser = { name: string; firstName?: string | null; lastName?: string | null; email: string; role?: string | null };

function initials(u: ShellUser) {
  const parts = [u.firstName, u.lastName].filter(Boolean) as string[];
  const source = parts.length ? parts : u.name.split(/\s+/);
  return source.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function Avatar({ user }: { user: ShellUser }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary">
      {initials(user)}
    </span>
  );
}

export function AppShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      <SkipLink />
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <Link href="/" className="px-2" aria-label="Reach Your Peak home">
          <Logo size="lg" />
        </Link>
        <div className="mt-8 flex-1">
          <SidebarNav />
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink"
            >
              <Settings className="size-5" aria-hidden /> Admin
            </Link>
          )}
        </div>
        <div className="border-t border-border pt-4">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-muted">
            <Avatar user={user} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{user.name}</span>
              <span className="block truncate text-xs text-ink-muted">{user.email}</span>
            </span>
          </Link>
          <SignOutButton className="mt-1 w-full" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" aria-label="Reach Your Peak home">
          <Logo size="sm" />
        </Link>
        <Link href="/profile" aria-label="Your profile">
          <Avatar user={user} />
        </Link>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl focus:outline-none px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      <BottomNav />
    </div>
  );
}
