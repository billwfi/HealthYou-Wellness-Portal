import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Footprints } from "lucide-react";
import { db } from "@/db";
import { requireUser } from "@/lib/session";
import { Card, CardBody } from "@/components/ui/card";
import { StepSyncSetup } from "@/components/devices/step-sync-setup";
import { SETUP_PATH, SHORTCUT_ICLOUD_URL } from "@/lib/step-sync";
import { SHORTCUT_PROVIDER } from "@/server/step-sync";
import { qrDataUri, siteOrigin } from "@/server/qr";

export const metadata: Metadata = { title: "Sync your steps from iPhone" };

/** Where the step-sync QR code lands. Members who aren't signed in come back here after signing in. */
export default async function ConnectStepsPage() {
  const user = await requireUser();
  const origin = await siteOrigin();
  const [connection, qr] = await Promise.all([
    db.deviceConnection.findUnique({ where: { userId_provider: { userId: user.id, provider: SHORTCUT_PROVIDER } }, select: { id: true } }),
    qrDataUri(`${origin}${SETUP_PATH}`),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/profile#steps" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Profile
      </Link>
      <header className="mt-4 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Footprints className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sync your steps from iPhone</h1>
          <p className="mt-1 text-ink-muted">Works with iPhone and Apple Watch through Apple Health. Do these steps on your iPhone.</p>
        </div>
      </header>

      <Card className="mt-6 hidden items-center gap-5 p-5 sm:flex">
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URI */}
        <img src={qr} alt="QR code that opens this page on your phone" width={120} height={120} className="shrink-0 rounded-xl border border-border" />
        <p className="text-sm text-ink">
          <strong>On a computer?</strong>{" "}Point your iPhone camera at this code to open this page there, then sign in if asked.
        </p>
      </Card>

      <Card className="mt-6">
        <CardBody className="p-5 sm:p-6">
          <StepSyncSetup syncUrl={`${origin}/api/sync/steps`} shortcutUrl={SHORTCUT_ICLOUD_URL} connected={Boolean(connection)} />
        </CardBody>
      </Card>
    </div>
  );
}
