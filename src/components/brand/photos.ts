import type { StaticImageData } from "next/image";
import type { ChallengeMetric, WellnessPath } from "@/lib/domain";
import heroPikesPeak from "@/assets/photos/hero-pikes-peak.jpg";
import challengesSummit from "@/assets/photos/challenges-summit.jpg";
import bodyStrawberries from "@/assets/photos/body-strawberries.jpg";
import bodySmoothie from "@/assets/photos/body-smoothie.jpg";
import bodySalad from "@/assets/photos/body-salad.jpg";
import bodyVegBowl from "@/assets/photos/body-veg-bowl.jpg";
import bodyCycling from "@/assets/photos/body-cycling.jpg";
import bodyDumbbells from "@/assets/photos/body-dumbbells.jpg";
import lifeFamily from "@/assets/photos/life-family.jpg";
import lifePiggyBank from "@/assets/photos/life-piggy-bank.jpg";
import lifeRedBicycle from "@/assets/photos/life-red-bicycle.jpg";
import lifeSunsetKayak from "@/assets/photos/life-sunset-kayak.jpg";
import lifeJournalBeach from "@/assets/photos/life-journal-beach.jpg";
import mindSunset from "@/assets/photos/mind-sunset.jpg";
import mindForestSunrays from "@/assets/photos/mind-forest-sunrays.jpg";
import mindTurquoiseLake from "@/assets/photos/mind-turquoise-lake.jpg";
import mindForestPath from "@/assets/photos/mind-forest-path.jpg";
import metricSteps from "@/assets/photos/metric-steps.jpg";
import metricDistance from "@/assets/photos/metric-distance.jpg";
import bannerExplore from "@/assets/photos/banner-explore.jpg";
import bannerRewards from "@/assets/photos/banner-rewards.jpg";
import bannerProgress from "@/assets/photos/banner-progress.jpg";
import bannerEvents from "@/assets/photos/banner-events.jpg";
import bannerProfile from "@/assets/photos/banner-profile.jpg";
import bannerWelcome from "@/assets/photos/banner-welcome.jpg";

// CC0 stock photos; see src/assets/photos/CREDITS.md.

export type Photo = { src: StaticImageData; alt: string; position?: string };

export const HERO_PHOTO = heroPikesPeak;
export const CHALLENGES_PHOTO = challengesSummit;

/** Page banners. Decorative, so alt text is empty where they're used. */
export const BANNERS = {
  explore: { src: bannerExplore, alt: "Aerial view of a colorful autumn forest", position: "center 50%" },
  challenges: { src: challengesSummit, alt: "Hikers on a mountain ridge", position: "center 60%" },
  progress: { src: bannerProgress, alt: "Running shoes mid-stride", position: "center 65%" },
  rewards: { src: bannerRewards, alt: "Friends cheering at sunset", position: "center 55%" },
  events: { src: bannerEvents, alt: "A fountain pen on an open journal", position: "center 45%" },
  profile: { src: bannerProfile, alt: "A person in a field at sunrise", position: "center 40%" },
  welcome: { src: bannerWelcome, alt: "Kayaks on a mountain lake", position: "center 55%" },
} satisfies Record<string, Photo>;

export const PATH_PHOTOS: Record<WellnessPath, Photo> = {
  body: { src: bodyStrawberries, alt: "Fresh strawberries at a market stall", position: "center 40%" },
  life: { src: lifeFamily, alt: "A father hugging his laughing daughter", position: "center 30%" },
  mind: { src: mindSunset, alt: "A woman stretching toward a sunset", position: "center 35%" },
};

/** Several photos per path, so a page of content cards doesn't repeat one image. */
const CONTENT_POOLS: Record<WellnessPath, Photo[]> = {
  body: [
    PATH_PHOTOS.body,
    { src: bodySmoothie, alt: "Fruit smoothie bowls" },
    { src: bodySalad, alt: "A fresh green salad" },
    { src: bodyVegBowl, alt: "A colorful vegetable bowl" },
    { src: bodyCycling, alt: "A cyclist on a city street" },
    { src: bodyDumbbells, alt: "A pair of dumbbells" },
  ],
  life: [
    PATH_PHOTOS.life,
    { src: lifePiggyBank, alt: "A pink piggy bank" },
    { src: lifeRedBicycle, alt: "A red bicycle by a garden" },
    { src: lifeSunsetKayak, alt: "A kayaker at sunset" },
    { src: lifeJournalBeach, alt: "Someone writing in a journal at the beach" },
  ],
  mind: [
    PATH_PHOTOS.mind,
    { src: mindForestSunrays, alt: "Sunrays through an autumn forest" },
    { src: mindTurquoiseLake, alt: "A turquoise mountain lake" },
    { src: mindForestPath, alt: "A winding path through a forest" },
  ],
};

/** A stable photo for a piece of content: same item, same photo, every time. */
export function contentPhoto(item: { id: number; path: string }): Photo {
  const pool = CONTENT_POOLS[item.path as WellnessPath] ?? CONTENT_POOLS.body;
  return pool[item.id % pool.length];
}

export const METRIC_PHOTOS: Record<ChallengeMetric, Photo> = {
  steps: { src: metricSteps, alt: "A path through a green forest" },
  active_minutes: { src: bodyCycling, alt: "A cyclist on a city street" },
  distance_miles: { src: metricDistance, alt: "A hiking trail through the hills" },
  workouts: { src: bodyDumbbells, alt: "A pair of dumbbells" },
  servings: { src: bodyVegBowl, alt: "A colorful vegetable bowl" },
  habit_checkins: { src: bannerEvents, alt: "A fountain pen on an open journal" },
};

export function challengePhoto(metric: string): Photo {
  return METRIC_PHOTOS[metric as ChallengeMetric] ?? { src: challengesSummit, alt: "Hikers on a mountain ridge" };
}
