"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, Footprints, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createStepSyncKey, turnOffStepSync } from "@/app/(app)/profile/actions";

type Props = {
  syncUrl: string;
  connected: boolean;
  /** e.g. "8,432 steps for Tue, Nov 26 Â· synced 9:02 PM" */
  lastSync: string | null;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 rounded-lg border border-input-border bg-surface-muted px-2.5 py-1.5 font-mono text-xs break-all text-ink">{value}</code>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-surface-muted"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          <span aria-live="polite">
            {copied ? "Copied" : "Copy"}
            <span className="sr-only"> {label}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function SetupSteps({ syncUrl, keyValue }: { syncUrl: string; keyValue: string | null }) {
  const header = keyValue ? `Bearer ${keyValue}` : "Bearer (your sync key)";
  return (
    <ol className="list-decimal space-y-3 pl-5 text-ink marker:font-semibold marker:text-ink-muted">
      <li>
        On your iPhone, open the <strong>Shortcuts</strong> app, tap <strong>+</strong> and name the shortcut <strong>Reach Your Peak steps</strong>.
      </li>
      <li>
        Add the action <strong>Find Health Samples</strong>. Set <em>Type</em> to <strong>Steps</strong>, the filter to <strong>Start Date is Today</strong>, and{" "}
        <strong>Group By</strong> to <strong>Day</strong>. Grouping by day keeps iPhone and Apple Watch steps from being counted twice.
      </li>
      <li>
        Add <strong>Calculate Statistics</strong> and set it to <strong>Sum</strong> of the Health Samples.
      </li>
      <li className="space-y-2">
        <p>
          Add <strong>Get Contents of URL</strong>, paste this address, then tap the arrow to show more options:
        </p>
        <CopyField label="Address" value={syncUrl} />
        <p>
          Set <em>Method</em> to <strong>POST</strong>. Under <em>Headers</em>, add <strong>Authorization</strong> with this value:
        </p>
        <CopyField label="Authorization header" value={header} />
        <p>
          Set <em>Request Body</em> to <strong>JSON</strong>, add a <strong>Number</strong> field named <strong>steps</strong>, and choose the{" "}
          <strong>Statistics</strong> result as its value.
        </p>
      </li>
      <li>
        Optional: add <strong>Show Notification</strong> with the <strong>Contents of URL</strong> so you see what was synced.
      </li>
      <li>
        Tap <strong>Done</strong>, then run the shortcut once. Allow access to Health and to this site when asked.
      </li>
      <li>
        To sync every day: open the <strong>Automation</strong> tab, tap <strong>+</strong>, choose <strong>Time of Day</strong>, pick <strong>9:00 PM</strong>{" "}
        and <strong>Daily</strong>, choose <strong>Run Immediately</strong>, then pick your shortcut.
      </li>
    </ol>
  );
}

/** Profile card: set up the Apple Shortcut that sends each day's step total. */
export function StepSyncSettings({ syncUrl, connected, lastSync }: Props) {
  const [key, setKey] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [pending, startTransition] = useTransition();
  const keyHeading = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (key) keyHeading.current?.focus();
  }, [key]);

  function makeKey() {
    setConfirmReplace(false);
    startTransition(async () => {
      const res = await createStepSyncKey();
      setKey(res.key);
    });
  }

  function turnOff() {
    startTransition(async () => {
      await turnOffStepSync();
      setKey(null);
    });
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start gap-3">
        <Footprints className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          {connected ? (
            <>
              <p className="font-semibold text-ink">iPhone step sync is on.</p>
              <p className="text-ink-muted">{lastSync ? `Last sync: ${lastSync}.` : "Waiting for the first sync from your shortcut."}</p>
            </>
          ) : (
            <p className="text-ink">
              Send your daily step count from Apple Health (iPhone and Apple Watch) using a free Apple Shortcut. Setup takes a few minutes.
            </p>
          )}
          <p className="text-ink-muted">Synced steps replace any steps you typed in for that day.</p>
        </div>
      </div>

      {key ? (
        <div className="space-y-4 rounded-2xl border border-border p-4">
          <p ref={keyHeading} tabIndex={-1} className="flex items-center gap-2 font-semibold text-ink outline-hidden">
            <KeyRound className="size-4 text-primary" aria-hidden /> Your sync key is ready
          </p>
          <p className="text-ink-muted">
            It&apos;s only shown now, so finish the steps below before leaving this page. Keep it private: anyone with it can send steps to your account.
          </p>
          <SetupSteps syncUrl={syncUrl} keyValue={key} />
        </div>
      ) : connected ? (
        <details className="rounded-2xl border border-border p-4">
          <summary className="cursor-pointer font-semibold text-ink">Setup steps</summary>
          <div className="mt-3 space-y-3">
            <p className="text-ink-muted">Your key can&apos;t be shown again. Need it for a new phone? Get a new key below, then update the shortcut.</p>
            <SetupSteps syncUrl={syncUrl} keyValue={null} />
          </div>
        </details>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {!connected && !key ? (
          <Button size="sm" onClick={makeKey} disabled={pending}>
            <KeyRound className="size-4" aria-hidden /> {pending ? "Setting upâ€¦" : "Set up iPhone step sync"}
          </Button>
        ) : confirmReplace ? (
          <>
            <p className="w-full text-ink">Your current shortcut will stop working until you paste in the new key.</p>
            <Button size="sm" onClick={makeKey} disabled={pending}>
              Get a new key
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReplace(false)} disabled={pending}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => setConfirmReplace(true)} disabled={pending}>
              Get a new key
            </Button>
            <Button size="sm" variant="ghost" onClick={turnOff} disabled={pending}>
              Turn off sync
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
