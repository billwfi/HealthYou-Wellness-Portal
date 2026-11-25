// Idempotent reference-data seed: tags, habits, activity types, points rules,
// reward tiers, challenge templates, challenges, events and starter content.
// Usage: npm run db:seed
import type { ContentType, PointsCategory, WellnessPath } from "../src/lib/domain";
import { db } from "./db";

const PLAN_YEAR = new Date().getFullYear();

type Path = WellnessPath;

const TAGS: { slug: string; label: string; path: Path }[] = [
  { slug: "physical-activity", label: "Physical activity", path: "body" },
  { slug: "strength", label: "Strength training", path: "body" },
  { slug: "nutrition", label: "Nutrition & cooking", path: "body" },
  { slug: "weight", label: "Healthy weight", path: "body" },
  { slug: "heart-health", label: "Heart health", path: "body" },
  { slug: "preventive-care", label: "Preventive care & screenings", path: "body" },
  { slug: "ergonomics", label: "Ergonomics & pain", path: "body" },
  { slug: "finances", label: "Financial wellbeing", path: "life" },
  { slug: "family", label: "Family & parenting", path: "life" },
  { slug: "caregiving", label: "Caregiving", path: "life" },
  { slug: "career", label: "Career growth", path: "life" },
  { slug: "community", label: "Community & volunteering", path: "life" },
  { slug: "retirement", label: "Retirement planning", path: "life" },
  { slug: "stress", label: "Stress management", path: "mind" },
  { slug: "mindfulness", label: "Mindfulness", path: "mind" },
  { slug: "sleep", label: "Sleep", path: "mind" },
  { slug: "resilience", label: "Resilience", path: "mind" },
  { slug: "emotional-health", label: "Emotional health", path: "mind" },
  { slug: "grief", label: "Grief & loss support", path: "mind" },
];

const HABITS: { slug: string; title: string; path: Path; tag: string; points: number }[] = [
  { slug: "water-8", title: "Drink 8 glasses of water", path: "body", tag: "nutrition", points: 5 },
  { slug: "fruit-veg-5", title: "Eat 5 servings of fruits & vegetables", path: "body", tag: "nutrition", points: 5 },
  { slug: "move-30", title: "Move for 30 minutes", path: "body", tag: "physical-activity", points: 5 },
  { slug: "stretch-break", title: "Take a stretch break at work", path: "body", tag: "ergonomics", points: 5 },
  { slug: "sleep-7", title: "Get 7+ hours of sleep", path: "mind", tag: "sleep", points: 5 },
  { slug: "mindful-5", title: "5 minutes of mindfulness", path: "mind", tag: "mindfulness", points: 5 },
  { slug: "gratitude", title: "Write down one thing you're grateful for", path: "mind", tag: "emotional-health", points: 5 },
  { slug: "no-spend", title: "Track today's spending", path: "life", tag: "finances", points: 5 },
  { slug: "connect", title: "Reach out to a friend or family member", path: "life", tag: "family", points: 5 },
];

const ACTIVITY_TYPES = [
  { slug: "steps", name: "Steps", category: "physical_activity", metric: "steps", unit: "steps", pointsPerUnit: "0.001" },
  { slug: "walking", name: "Walking", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.1" },
  { slug: "running", name: "Running", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.15" },
  { slug: "cycling", name: "Cycling", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.12" },
  { slug: "swimming", name: "Swimming", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.15" },
  { slug: "strength", name: "Strength training", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.12" },
  { slug: "yoga", name: "Yoga", category: "physical_activity", metric: "active_minutes", unit: "min", pointsPerUnit: "0.1" },
  { slug: "distance", name: "Distance (walk, run or roll)", category: "physical_activity", metric: "distance_miles", unit: "mi", pointsPerUnit: "1" },
  { slug: "fruit-veg", name: "Fruit & vegetable servings", category: "nutrition", metric: "servings", unit: "servings", pointsPerUnit: "1" },
  { slug: "water", name: "Water", category: "nutrition", metric: "servings", unit: "glasses", pointsPerUnit: "0.5" },
] as const;

const POINTS_RULES = [
  { slug: "physical-activity", label: "Physical activity (logged or synced)", category: "physical_activity", points: 1, maxPerDay: 20 },
  { slug: "nutrition", label: "Nutrition logging", category: "nutrition", points: 1, maxPerDay: 10 },
  { slug: "daily-habit", label: "Daily habit check-in", category: "daily_habit", points: 5, maxPerDay: 15 },
  { slug: "content", label: "Complete an article, video or webinar", category: "content", points: 10, maxPerDay: 20 },
  { slug: "assessment", label: "Complete the wellbeing assessment", category: "assessment", points: 100, maxPerYear: 100 },
  { slug: "screening", label: "Complete a biometric screening", category: "screening", points: 250, maxPerYear: 250 },
  { slug: "challenge", label: "Finish a challenge", category: "challenge", points: 100 },
  { slug: "special-activity", label: "City wellness event or workshop", category: "special_activity", points: 25 },
] as const;

const REWARD_TIERS = [
  { threshold: 250, label: "Base Camp", reward: "Reach Your Peak swag" },
  { threshold: 750, label: "Trailhead", reward: "$50 wellness gift card" },
  { threshold: 1500, label: "Summit", reward: "Annual wellness incentive" },
];

const TEMPLATES = [
  { slug: "step-leaderboard", name: "Step Showdown", type: "leaderboard", metric: "steps", unit: "steps", goalValue: null, durationDays: 28, description: "Most steps wins. Teams ranked by average steps per member." },
  { slug: "move-target", name: "Move 600", type: "target", metric: "active_minutes", unit: "min", goalValue: "600", durationDays: 28, description: "Log 600 active minutes in four weeks, with milestones along the way." },
  { slug: "hydration-streak", name: "Hydration Streak", type: "streak", metric: "habit_checkins", unit: "days", goalValue: "21", durationDays: 21, description: "Hit your water goal every day — how long can you keep it going?" },
  { slug: "mindful-stick", name: "Still Waters", type: "stick_to_it", metric: "habit_checkins", unit: "days", goalValue: "20", durationDays: 30, description: "Practice mindfulness on 20 of the next 30 days." },
  { slug: "pikes-peak-race", name: "Race to Pikes Peak", type: "race", metric: "distance_miles", unit: "mi", goalValue: "26", durationDays: 42, description: "Walk, run or roll the 26 virtual miles of Barr Trail to the summit." },
  { slug: "city-group-goal", name: "City Moves Together", type: "group_goal", metric: "active_minutes", unit: "min", goalValue: "250000", durationDays: 30, description: "Every minute counts toward one city-wide goal." },
] as const;

const CHALLENGES = [
  { slug: "ryp-2026-1-olympic-city-strength", name: "RYP 2026 #1: Olympic City Strength Challenge", type: "target", metric: "workouts", unit: "times", goalValue: "8", startDate: "2026-02-02", endDate: "2026-03-16", description: "Strength and fitness challenge." },
  { slug: "ryp-2026-2-eat-think-thrive", name: "RYP 2026 #2: Eat, Think, Thrive", type: "target", metric: "habit_checkins", unit: "times", goalValue: "8", startDate: "2026-05-11", endDate: "2026-06-25", description: "Mind challenge focused on nutrition and mindfulness." },
] as const;

const EVENTS = [
  { title: "Personal Finance 101", provider: "Nationwide", eventDate: "2026-05-27", startTime: "09:00", endTime: "10:00" },
  { title: "Dealing with Prolonged Grief", provider: "Profile EAP", eventDate: "2026-05-27", startTime: "09:00", endTime: "10:00" },
  { title: "Spend with Intention", provider: "Ent Credit Union", eventDate: "2026-05-28", startTime: "09:30", endTime: "10:00" },
  { title: "Investment Basics – Retire and Rewards", provider: "Nationwide", eventDate: "2026-06-04", startTime: "09:00", endTime: "10:00" },
  { title: "Parenting Your Teens: Career and Life Goals", provider: "Profile EAP", eventDate: "2026-06-10", startTime: "11:30", endTime: "12:30" },
];

const CONTENT: { slug: string; title: string; type: ContentType; path: Path; tags: string[]; provider?: string; summary: string }[] = [
  { slug: "healthyou-health-coaching", title: "HealthYou Health Coaching", type: "program", path: "body", tags: ["weight", "nutrition", "stress"], provider: "HealthYou", summary: "Free one-on-one coaching to set and reach your goals." },
  { slug: "biometric-screening", title: "Biometric Screening", type: "program", path: "body", tags: ["preventive-care", "heart-health"], summary: "Know your numbers — schedule your annual screening." },
  { slug: "weight-management-program", title: "Weight Management Program", type: "program", path: "body", tags: ["weight", "nutrition"], provider: "UCCS", summary: "A supportive, evidence-based program for sustainable change." },
  { slug: "uccs-cooking-class", title: "UCCS Cooking Class", type: "program", path: "body", tags: ["nutrition"], provider: "UCCS", summary: "Hands-on classes for quick, healthy meals." },
  { slug: "make-a-healthy-plate", title: "Make a Healthy Plate", type: "article", path: "body", tags: ["nutrition", "weight"], summary: "A simple formula for balanced meals." },
  { slug: "15-fruit-veg-staples", title: "15 Fruit & Vegetable Staples", type: "recipe", path: "body", tags: ["nutrition"], summary: "Keep these on hand for easy, healthy cooking." },
  { slug: "coachs-corner-mediterranean", title: "Coach's Corner: Mediterranean Magic", type: "article", path: "body", tags: ["nutrition", "heart-health"], provider: "HealthYou", summary: "Why the Mediterranean pattern works — and how to start." },
  { slug: "office-ergonomics", title: "Office Ergonomics Personal Program", type: "program", path: "body", tags: ["ergonomics"], summary: "Set up your workspace to prevent pain." },
  { slug: "financial-wellbeing-program", title: "Financial Wellbeing Personal Program", type: "program", path: "life", tags: ["finances"], summary: "Budgeting, debt and saving, one step at a time." },
  { slug: "fresh-start-finance", title: "Fresh Start Finance", type: "program", path: "life", tags: ["finances"], summary: "A self-paced challenge to reset your money habits." },
  { slug: "caregiver-wellbeing", title: "Caregiver Well-Being Personal Program", type: "program", path: "life", tags: ["caregiving", "family"], summary: "Support for people caring for loved ones." },
  { slug: "city-employee-development", title: "City Employee Development Programs", type: "resource", path: "life", tags: ["career"], provider: "City of Colorado Springs", summary: "Training and growth opportunities across the City." },
  { slug: "community-action-co8", title: "Community Action CO8", type: "resource", path: "life", tags: ["community"], summary: "Volunteer opportunities around Colorado Springs." },
  { slug: "mindfulness-program", title: "Mindfulness Personal Program", type: "program", path: "mind", tags: ["mindfulness", "stress"], summary: "Build a mindfulness practice that sticks." },
  { slug: "resiliency-program", title: "Resiliency Personal Program", type: "program", path: "mind", tags: ["resilience", "stress"], summary: "Tools to bounce back from setbacks." },
  { slug: "mindful-moment-series", title: "Mindful Moment Series", type: "video", path: "mind", tags: ["mindfulness"], summary: "Short guided practices for busy days." },
  { slug: "still-waters", title: "Still Waters Self-Paced Challenge", type: "program", path: "mind", tags: ["mindfulness", "sleep"], summary: "A calm, self-paced reset." },
  { slug: "uccs-flourish", title: "UCCS Wellness Workshop: Flourish", type: "webinar", path: "mind", tags: ["emotional-health", "resilience"], provider: "UCCS", summary: "Practical strategies for thriving." },
  { slug: "online-mental-health-assessments", title: "Online Mental Health Assessments", type: "resource", path: "mind", tags: ["emotional-health"], provider: "Profile EAP", summary: "Confidential self-checks through the EAP." },
];

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const time = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);

async function main() {
  console.log(`Seeding reference data for plan year ${PLAN_YEAR}…`);

  for (const [i, t] of TAGS.entries()) {
    await db.tag.upsert({
      where: { slug: t.slug },
      create: { ...t, sortOrder: i },
      update: { label: t.label, path: t.path, sortOrder: i },
    });
  }
  const tagRows = await db.tag.findMany({ select: { id: true, slug: true } });
  const tagId = (slug: string) => {
    const row = tagRows.find((t) => t.slug === slug);
    if (!row) throw new Error(`Unknown tag ${slug}`);
    return row.id;
  };

  for (const { tag, ...h } of HABITS) {
    await db.habit.upsert({ where: { slug: h.slug }, create: { ...h, tagId: tagId(tag) }, update: {} });
  }

  for (const a of ACTIVITY_TYPES) {
    await db.activityType.upsert({ where: { slug: a.slug }, create: { ...a }, update: {} });
  }

  for (const r of POINTS_RULES) {
    const category: PointsCategory = r.category;
    await db.pointsRule.upsert({
      where: { planYear_slug: { planYear: PLAN_YEAR, slug: r.slug } },
      create: { ...r, category, planYear: PLAN_YEAR },
      update: {},
    });
  }

  if ((await db.rewardTier.count({ where: { planYear: PLAN_YEAR } })) === 0) {
    await db.rewardTier.createMany({ data: REWARD_TIERS.map((t, i) => ({ ...t, planYear: PLAN_YEAR, sortOrder: i })) });
  }

  for (const t of TEMPLATES) {
    await db.challengeTemplate.upsert({ where: { slug: t.slug }, create: { ...t }, update: {} });
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const c of CHALLENGES) {
    const status = c.endDate < today ? "completed" : c.startDate <= today ? "active" : "scheduled";
    await db.challenge.upsert({
      where: { slug: c.slug },
      create: {
        ...c,
        startDate: day(c.startDate),
        endDate: day(c.endDate),
        teamMode: "hybrid",
        pointsOnCompletion: 100,
        status,
      },
      update: { status },
    });
  }

  if ((await db.event.count()) === 0) {
    await db.event.createMany({
      data: EVENTS.map((e) => ({
        ...e,
        eventDate: day(e.eventDate),
        startTime: time(e.startTime),
        endTime: time(e.endTime),
        eventType: "webinar",
        points: 25,
      })),
    });
  }

  for (const { tags, ...item } of CONTENT) {
    const row = await db.contentItem.upsert({
      where: { slug: item.slug },
      create: { ...item, points: 10, publishedAt: new Date() },
      update: { title: item.title, summary: item.summary },
      select: { id: true },
    });
    for (const t of tags) {
      const key = { contentId: row.id, tagId: tagId(t) };
      await db.contentTag.upsert({ where: { contentId_tagId: key }, create: key, update: {} });
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
