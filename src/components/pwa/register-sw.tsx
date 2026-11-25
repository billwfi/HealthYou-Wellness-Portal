"use client";

import { useEffect } from "react";

/** Registers /sw.js (push notifications and the offline page). Renders nothing. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((err) => console.warn("service worker registration failed", err));
  }, []);
  return null;
}
