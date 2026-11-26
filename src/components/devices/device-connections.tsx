import { AlertTriangle, CheckCircle2, Plug, Watch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ActionButton } from "@/components/content/action-button";
import { Notice } from "@/components/ui/notice";
import { deviceLabel } from "@/lib/terra";
import { PROGRAM_TIME_ZONE } from "@/lib/dates";
import { demoSendWeekAction, disconnectDeviceAction, startDeviceConnect } from "@/app/(app)/connect/devices/actions";

type Connection = {
  id: number;
  provider: string;
  status: string;
  lastSyncedAt: Date | null;
  lastValue: number | null;
  lastDay: Date | null;
  lastError: string | null;
};

const NOTICES: Record<string, { text: string; ok: boolean }> = {
  connected: { text: "Device connected. Your steps will arrive as your device syncs.", ok: true },
  synced: { text: "Sample steps received. Check Progress to see them.", ok: true },
  disconnected: { text: "Device disconnected. Steps already synced stay on your record.", ok: true },
  unavailable: { text: "Couldn't open the device connection page. Try again in a few minutes.", ok: false },
  "disconnect-failed": { text: "Couldn't disconnect that device. Try again in a few minutes.", ok: false },
};

function syncLine(c: Connection) {
  if (c.status === "error") return c.lastError ?? "There's a problem with this connection. Try disconnecting and connecting again.";
  if (!c.lastSyncedAt) return "Connected. Waiting for the first sync.";
  const at = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: PROGRAM_TIME_ZONE }).format(c.lastSyncedAt);
  if (c.lastValue == null || !c.lastDay) return `Last sync ${at}`;
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(c.lastDay);
  return `${c.lastValue.toLocaleString()} steps for ${day} · synced ${at}`;
}

/** Profile card: devices connected through Terra, plus the way to add one. */
export function DeviceConnections({ connections, demo, notice }: { connections: Connection[]; demo: boolean; notice?: string }) {
  const n = notice ? NOTICES[notice] : undefined;
  return (
    <div className="space-y-4 text-sm">
      {demo && (
        <p className="rounded-xl bg-warning-soft px-3 py-2 text-warning">
          <strong>Demo mode.</strong>{" "}Devices and steps here are simulated until the program&apos;s Terra account is connected.
        </p>
      )}
      {n && (
        <Notice className={`rounded-xl px-3 py-2 font-medium ${n.ok ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`}>{n.text}</Notice>
      )}

      {connections.length ? (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {connections.map((c) => {
            const name = deviceLabel(c.provider);
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                <Watch className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {name}
                    {c.status === "error" ? (
                      <Badge tone="warning">
                        <AlertTriangle className="size-3" aria-hidden /> Needs attention
                      </Badge>
                    ) : (
                      <Badge tone="success">
                        <CheckCircle2 className="size-3" aria-hidden /> Connected
                      </Badge>
                    )}
                  </p>
                  <p className="text-ink-muted">{syncLine(c)}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {demo && (
                    <form action={demoSendWeekAction.bind(null, c.id)}>
                      <ActionButton className={buttonClasses({ variant: "secondary", size: "sm" })} pendingLabel="Sending…">
                        Send a sample week<span className="sr-only"> from {name}</span>
                      </ActionButton>
                    </form>
                  )}
                  <form action={disconnectDeviceAction.bind(null, c.id)}>
                    <ActionButton className={buttonClasses({ variant: "ghost", size: "sm" })} pendingLabel="Disconnecting…">
                      Disconnect<span className="sr-only"> {name}</span>
                    </ActionButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-ink-muted">
          Connect Apple Health, Android Health Connect, Garmin, Fitbit, Oura, Polar or Withings, and your daily steps arrive automatically for challenges and points.
        </p>
      )}

      <form action={startDeviceConnect}>
        <ActionButton className={buttonClasses({ size: "sm", variant: connections.length ? "secondary" : "primary" })} pendingLabel="Opening…">
          <Plug className="size-4" aria-hidden /> {connections.length ? "Connect another device" : "Connect a device"}
        </ActionButton>
      </form>
      <p className="text-xs text-ink-muted">If two devices report steps for the same day, the higher total counts. Synced steps replace steps you typed in.</p>
    </div>
  );
}
