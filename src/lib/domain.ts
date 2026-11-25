// Allowed values for enum-like columns. SQL Server has no native enums in
// Prisma, so these are the source of truth (validate with z.enum(...)).

export const WELLNESS_PATHS = ["body", "life", "mind"] as const;
export const MEMBER_TYPES = ["employee", "spouse", "retiree"] as const;
export const USER_ROLES = ["member", "admin"] as const;
export const CONTENT_TYPES = ["article", "video", "webinar", "program", "recipe", "resource"] as const;
export const EVENT_TYPES = ["webinar", "workshop", "class", "screening", "other"] as const;
export const POINTS_CATEGORIES = [
  "physical_activity",
  "nutrition",
  "daily_habit",
  "special_activity",
  "content",
  "challenge",
  "assessment",
  "screening",
  "adjustment",
] as const;
export const ACTIVITY_SOURCES = ["manual", "device", "import", "admin"] as const;
export const CHALLENGE_TYPES = ["leaderboard", "target", "streak", "stick_to_it", "race", "group_goal"] as const;
export const TEAM_MODES = ["individual", "team", "hybrid"] as const;
export const CHALLENGE_STATUSES = ["draft", "scheduled", "active", "completed", "archived"] as const;

export type WellnessPath = (typeof WELLNESS_PATHS)[number];
export type MemberType = (typeof MEMBER_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type PointsCategory = (typeof POINTS_CATEGORIES)[number];
export type ActivitySource = (typeof ACTIVITY_SOURCES)[number];
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];
export type TeamMode = (typeof TEAM_MODES)[number];
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];
