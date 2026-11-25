"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveNotificationPrefs, sendTestNotification, subscribeDevice, unsubscribeDevice } from "@/app/(app)/profile/actions";

type Status = "checking" | "unsupported" | "ios-install" | "denied" | "off" | "on";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function keyBytes(base64: string) {
  const b64 = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Install the app and turn push notifications on or off for this device. */
export function NotificationSettings({ publicKey, reminders, news }: { publicKey: string | null; reminders: boolean; news: boolean }) {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    (async () => {
      setStandalone(isStandalone);
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        // iPhone and iPad get push only once the app is on the home screen.
        setStatus(isIOS && !isStandalone ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setStatus("denied");
      const reg = await navigator.serviceWorker.ready;
      setStatus((await reg.pushManager.getSubscription()) ? "on" : "off");
    })();
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function turnOn() {
    setMessage(null);
    startTransition(async () => {
      try {
        if ((await Notification.requestPermission()) !== "granted") {
          setStatus(Notification.permission === "denied" ? "denied" : "off");
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey!) });
        const res = await subscribeDevice(JSON.parse(JSON.stringify(sub)));
        if (!res.ok) throw new Error("rejected");
        setStatus("on");
      } catch {
        setMessage("Couldn't turn on notifications on this device. Try again in a moment.");
      }
    });
  }

  function turnOff() {
    setMessage(null);
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeDevice(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    });
  }

  function test() {
    setMessage(null);
    startTransition(async () => {
      const { delivered } = await sendTestNotification();
      setMessage(delivered ? "Sent. It should appear in a few seconds." : "Nothing was delivered. Turn notifications off and on again.");
    });
  }

  return (
    <div className="space-y-5 text-sm">
      {!standalone && (
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-2">
            <p className="text-ink">Add Reach Your Peak to your home screen to open it like an app.</p>
            {installEvent ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await installEvent.prompt();
                  await installEvent.userChoice;
                  setInstallEvent(null);
                }}
              >
                <Download className="size-4" aria-hidden /> Install app
              </Button>
            ) : (
              <p className="text-ink-muted">
                On iPhone or iPad: tap <Share className="inline size-4 align-text-bottom" aria-label="Share" /> in Safari, then <strong>Add to Home Screen</strong>. On Android:
                open the browser menu and choose <strong>Install app</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 border-t border-border pt-5">
        <Bell className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          {!publicKey ? (
            <p className="text-ink-muted">Notifications aren&apos;t available yet.</p>
          ) : status === "checking" ? (
            <p className="text-ink-muted">Checking this device…</p>
          ) : status === "unsupported" ? (
            <p className="text-ink-muted">This browser doesn&apos;t support notifications.</p>
          ) : status === "ios-install" ? (
            <p className="text-ink-muted">On iPhone and iPad, add the app to your home screen first, then open it from there to turn on notifications.</p>
          ) : status === "denied" ? (
            <p className="text-ink-muted">Notifications are blocked for this site. Allow them in your browser or phone settings, then come back here.</p>
          ) : status === "on" ? (
            <>
              <p className="font-semibold text-ink">Notifications are on for this device.</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={test} disabled={pending}>
                  Send a test
                </Button>
                <Button size="sm" variant="ghost" onClick={turnOff} disabled={pending}>
                  <BellOff className="size-4" aria-hidden /> Turn off
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-ink">Get habit reminders, challenge updates and program news on this device.</p>
              <Button size="sm" onClick={turnOn} disabled={pending}>
                <Bell className="size-4" aria-hidden /> {pending ? "Turning on…" : "Turn on notifications"}
              </Button>
            </>
          )}
          {message && (
            <p role="status" className="text-ink-muted">
              {message}
            </p>
          )}
        </div>
      </div>

      <form action={saveNotificationPrefs} className="space-y-2 border-t border-border pt-5">
        <fieldset className="space-y-2">
          <legend className="font-semibold text-ink">What to send</legend>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" name="reminders" defaultChecked={reminders} className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium text-ink">Reminders</span>
              <span className="block text-ink-muted">An evening nudge if you haven&apos;t checked a habit, and when your challenges start or end</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <input type="checkbox" name="news" defaultChecked={news} className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium text-ink">Program news</span>
              <span className="block text-ink-muted">New challenges, events and announcements</span>
            </span>
          </label>
        </fieldset>
        <p className="text-xs text-ink-muted">You&apos;ll always hear when a reward is on its way or a screening is verified.</p>
        <Button type="submit" size="sm" variant="secondary">
          Save
        </Button>
      </form>
    </div>
  );
}
