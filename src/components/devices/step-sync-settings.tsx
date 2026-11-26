import { Footprints, Smartphone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ActionButton } from "@/components/content/action-button";
import { buttonClasses } from "@/components/ui/button";
import { turnOffStepSync } from "@/app/(app)/profile/actions";
import { SETUP_PATH } from "@/lib/step-sync";

type Props = {
  connected: boolean;
  /** e.g. "8,432 steps for Thu, Nov 26, sent Nov 26, 9:02 PM" */
  lastSync: string | null;
  /** QR code (data URI) that opens the setup page on a phone */
  qr: string;
};

/** Profile card: sync status, a QR code for desktop visitors, and the way into setup. */
export function StepSyncSettings({ connected, lastSync, qr }: Props) {
  return (
    <div className="flex flex-col gap-5 text-sm sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-start gap-3">
          <Footprints className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-2">
            {connected ? (
              <>
                <p className="font-semibold text-ink">iPhone step sync is on.</p>
                <p className="text-ink-muted">{lastSync ? `Last sync: ${lastSync}.` : "Waiting for the first sync from your shortcut."}</p>
              </>
            ) : (
              <p className="text-ink">Send your daily steps from Apple Health (iPhone and Apple Watch) with a free Apple Shortcut. Setup takes a few minutes.</p>
            )}
            <p className="text-ink-muted">Synced steps replace any steps you typed in for that day.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={SETUP_PATH} size="sm" variant={connected ? "secondary" : "primary"}>
            <Smartphone className="size-4" aria-hidden /> {connected ? "Set up a new phone" : "Set up on this iPhone"}
          </ButtonLink>
          {connected && (
            <form action={turnOffStepSync}>
              <ActionButton className={buttonClasses({ variant: "ghost", size: "sm" })} pendingLabel="Turning off…">
                Turn off sync
              </ActionButton>
            </form>
          )}
        </div>
      </div>

      <figure className="hidden shrink-0 text-center sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI */}
        <img src={qr} alt="QR code that opens step sync setup on your phone" width={132} height={132} className="rounded-xl border border-border" />
        <figcaption className="mt-1.5 w-33 text-xs text-ink-muted">On a computer? Scan with your iPhone camera.</figcaption>
      </figure>
    </div>
  );
}
