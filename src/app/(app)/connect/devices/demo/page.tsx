import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Watch } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { ActionButton } from "@/components/content/action-button";
import { TERRA_PROVIDERS } from "@/lib/terra";
import { terraMode } from "@/server/terra";
import { demoConnectAction } from "../actions";

export const metadata: Metadata = { title: "Connect a device (demo)" };

/** Stands in for Terra's connect page until the program's Terra account is set up. */
export default async function DemoConnectPage() {
  await requireUser();
  if (terraMode() !== "demo") redirect("/profile#devices");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/profile#devices" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Profile
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">Connect a device</h1>
      <p className="mt-2 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
        <strong>Demo.</strong>{" "}This page stands in for Terra&apos;s connect screen, where members sign in to their device account. Picking one here connects a
        simulated device.
      </p>
      <Card className="mt-6">
        <ul className="divide-y divide-border">
          {TERRA_PROVIDERS.map((p) => (
            <li key={p.code}>
              <form action={demoConnectAction.bind(null, p.code)}>
                <ActionButton className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-surface-muted" pendingLabel={`Connecting ${p.label}…`}>
                  <Watch className="size-5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{p.label}</span>
                    <span className="block text-sm text-ink-muted">{p.hint}</span>
                  </span>
                </ActionButton>
              </form>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
