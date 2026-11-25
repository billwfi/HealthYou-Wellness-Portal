"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A result message shown after a redirect (e.g. "?notice=saved"). It is already
 * on the page when it loads, so a live region would stay silent: focusing it
 * makes screen readers read it, and puts keyboard users next to it.
 */
export function Notice({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <p ref={ref} id={id} role="status" tabIndex={-1} className={`scroll-mt-24 focus:outline-none ${className ?? ""}`}>
      {children}
    </p>
  );
}
