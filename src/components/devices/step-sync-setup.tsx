"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Download, KeyRound, Play, Timer } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { createStepSyncKey } from "@/app/(app)/profile/actions";
import { SHORTCUT_NAME } from "@/lib/step-sync";
import { cn } from "@/lib/utils";

function useCopy() {
  const [copied, setCopied] = useState(false);
  return {
    copied,
    copy: async (value: string) => {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
  };
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy();
  return (
    <div>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="min-w-0 flex-1 rounded-lg border border-input-border bg-surface-muted px-2.5 py-1.5 font-mono text-xs break-all text-ink">{value}</code>
        <button
          type="button"
          onClick={() => copy(value)}
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

/** Build-it-yourself steps, for when there's no ready-made shortcut link. */
function ManualSteps({ syncUrl, keyValue }: { syncUrl: string; keyValue: string | null }) {
  const header = keyValue ? `Bearer ${keyValue}` : "Bearer (your sync key)";
  return (
    <ol className="list-decimal space-y-3 pl-5 text-ink marker:font-semibold marker:text-ink-muted">
      <li>
        Open the <strong>Shortcuts</strong> app, tap <strong>+</strong> and name the shortcut <strong>{SHORTCUT_NAME}</strong>.
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
        Tap <strong>Done</strong>.
      </li>
    </ol>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
          done ? "bg-success-soft text-success" : "bg-primary-soft text-primary",
        )}
        aria-hidden
      >
        {done ? <Check className="size-4" /> : n}
      </span>
      <div className="min-w-0 flex-1 space-y-3 pb-2">
        <h2 className="pt-1 font-bold text-ink">
          <span className="sr-only">Step {n}: </span>
          {title}
          {done && <span className="sr-only"> (done)</span>}
        </h2>
        {children}
      </div>
    </li>
  );
}

type Props = {
  syncUrl: string;
  shortcutUrl: string;
  /** Sync was already set up before this visit. */
  connected: boolean;
};

/** The phone-side setup: create a key, add the shortcut, run it, schedule it. */
export function StepSyncSetup({ syncUrl, shortcutUrl, connected }: Props) {
  const [key, setKey] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [pending, startTransition] = useTransition();
  const { copied, copy } = useCopy();
  const keyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (key) keyRef.current?.focus();
  }, [key]);

  function makeKey() {
    setConfirmReplace(false);
    startTransition(async () => setKey((await createStepSyncKey()).key));
  }

  const runUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}`;

  return (
    <ol className="space-y-6 text-sm">
      <Step n={1} title="Create your sync key" done={Boolean(key)}>
        {key ? (
          <div className="space-y-3">
            <p ref={keyRef} tabIndex={-1} className="text-ink outline-hidden">
              Your key is ready. Copy it now; it&apos;s only shown once. Keep it private: anyone with it can send steps to your account.
            </p>
            <code className="block rounded-lg border border-input-border bg-surface-muted px-3 py-2 font-mono text-xs break-all text-ink">{key}</code>
            <Button onClick={() => copy(key)}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              <span aria-live="polite">{copied ? "Key copied" : "Copy key"}</span>
            </Button>
          </div>
        ) : connected && !confirmReplace ? (
          <div className="space-y-3">
            <p className="text-ink-muted">Step sync is already on for your account. Setting up a new phone? Create a new key; your old one stops working.</p>
            <Button variant="secondary" onClick={() => setConfirmReplace(true)}>
              <KeyRound className="size-4" aria-hidden /> Create a new key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {confirmReplace && <p className="text-ink">Your current shortcut will stop syncing until it has the new key.</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={makeKey} disabled={pending}>
                <KeyRound className="size-4" aria-hidden /> {pending ? "Creating…" : connected ? "Create a new key" : "Create my key"}
              </Button>
              {confirmReplace && (
                <Button variant="ghost" onClick={() => setConfirmReplace(false)} disabled={pending}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Add the shortcut">
        {shortcutUrl ? (
          <div className="space-y-3">
            <p className="text-ink-muted">
              Tap the button, then <strong className="text-ink">Add Shortcut</strong>. When it asks for your sync key, paste it.
            </p>
            <a href={shortcutUrl} className={buttonClasses({ variant: key ? "primary" : "secondary" })}>
              <Download className="size-4" aria-hidden /> Add the shortcut
            </a>
          </div>
        ) : (
          <details className="rounded-2xl border border-border p-4" open={Boolean(key)}>
            <summary className="cursor-pointer font-semibold text-ink">Build the shortcut (about 3 minutes)</summary>
            <div className="mt-3">
              <ManualSteps syncUrl={syncUrl} keyValue={key} />
            </div>
          </details>
        )}
      </Step>

      <Step n={3} title="Run it once">
        <p className="text-ink-muted">
          The first run asks to read your steps from Health and to connect to Reach Your Peak. Choose <strong className="text-ink">Allow</strong> (or{" "}
          <strong className="text-ink">Always Allow</strong>).
        </p>
        <a href={runUrl} className={buttonClasses({ variant: "secondary" })}>
          <Play className="size-4" aria-hidden /> Run it now
        </a>
      </Step>

      <Step n={4} title="Sync every evening">
        <ol className="list-decimal space-y-1.5 pl-5 text-ink marker:text-ink-muted">
          <li>
            In Shortcuts, open the <strong>Automation</strong> tab and tap <strong>+</strong> (or <strong>New Automation</strong>).
          </li>
          <li>
            Choose <strong>Time of Day</strong>, set <strong>9:00 PM</strong> and <strong>Daily</strong>, and choose <strong>Run Immediately</strong>.
          </li>
          <li>
            Tap <strong>Next</strong> and pick <strong>{SHORTCUT_NAME}</strong>.
          </li>
        </ol>
        <p className="flex items-start gap-2 text-ink-muted">
          <Timer className="mt-0.5 size-4 shrink-0" aria-hidden /> Walk after 9 pm? Run the shortcut again before bed. The latest run for the day counts.
        </p>
      </Step>

      <Step n={5} title="Check it worked">
        <p className="text-ink-muted">Today&apos;s steps show on Progress, marked &ldquo;Synced from Apple Health&rdquo;.</p>
        <Link href="/progress" className={buttonClasses({ variant: "secondary" })}>
          Go to Progress
        </Link>
      </Step>
    </ol>
  );
}
