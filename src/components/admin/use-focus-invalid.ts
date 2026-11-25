"use client";

import { useEffect, useRef } from "react";

/** After a failed save, move focus to the first field marked aria-invalid. Returns the form ref. */
export function useFocusFirstInvalid(state: unknown) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);
  return ref;
}
