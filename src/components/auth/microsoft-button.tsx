"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function MicrosoftButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await authClient.signIn.social({ provider: "microsoft", callbackURL: next });
        }}
      >
        <svg viewBox="0 0 21 21" className="size-4" aria-hidden>
          <path fill="#f25022" d="M1 1h9v9H1z" />
          <path fill="#00a4ef" d="M1 11h9v9H1z" />
          <path fill="#7fba00" d="M11 1h9v9h-9z" />
          <path fill="#ffb900" d="M11 11h9v9h-9z" />
        </svg>
        City employees: sign in with Microsoft
      </Button>
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
