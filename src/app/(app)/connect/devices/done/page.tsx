import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { deviceLabel } from "@/lib/terra";

export const metadata: Metadata = { title: "Device connection" };

/**
 * Where Terra sends members back after its connect screen. The connection itself
 * is recorded from Terra's signed webhook, not from these (unsigned) query values.
 */
export default async function DeviceDonePage({ searchParams }: { searchParams: Promise<{ failed?: string; resource?: string; reason?: string }> }) {
  await requireUser();
  const { failed, resource } = await searchParams;
  const name = resource ? deviceLabel(resource) : "Your device";

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8 text-center">
        {failed ? (
          <>
            <XCircle className="mx-auto size-12 text-accent" aria-hidden />
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">That didn&apos;t connect</h1>
            <p className="mt-2 text-ink-muted">{name} wasn&apos;t connected. You can try again from your profile.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">{name} is connected</h1>
            <p className="mt-2 text-ink-muted">Your steps will start arriving within a few minutes, and then whenever your device syncs.</p>
          </>
        )}
        <ButtonLink href="/profile#devices" className="mt-6">
          Back to profile
        </ButtonLink>
      </Card>
    </div>
  );
}
