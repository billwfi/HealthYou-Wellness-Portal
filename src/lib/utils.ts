/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Current program (plan) year. */
export function currentPlanYear(date = new Date()) {
  return date.getFullYear();
}

import type { WellnessPath } from "./domain";
export type { WellnessPath };

export const PATHS: Record<WellnessPath, { label: string; tagline: string }> = {
  body: { label: "Body", tagline: "Move, eat well and know your numbers" },
  life: { label: "Life", tagline: "Money, family, career and community" },
  mind: { label: "Mind", tagline: "Stress, sleep, focus and resilience" },
};
