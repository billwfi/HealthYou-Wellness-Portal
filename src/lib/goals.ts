import type { WellnessPath } from "./domain";

/** Starter goals offered during onboarding; members can also write their own. */
export const SUGGESTED_GOALS: Record<WellnessPath, string[]> = {
  body: ["Move more every day", "Eat more fruits and vegetables", "Reach a healthy weight", "Know my numbers"],
  life: ["Build an emergency fund", "Pay down debt", "Spend more time with family", "Grow my career"],
  mind: ["Manage stress better", "Sleep 7+ hours a night", "Start a mindfulness practice", "Build resilience"],
};

export const GOAL_MAX_LENGTH = 200;
export const MAX_HABITS = 5;
