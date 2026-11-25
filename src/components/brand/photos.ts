import type { StaticImageData } from "next/image";
import type { WellnessPath } from "@/lib/domain";
import heroPikesPeak from "@/assets/photos/hero-pikes-peak.jpg";
import challengesSummit from "@/assets/photos/challenges-summit.jpg";
import bodyStrawberries from "@/assets/photos/body-strawberries.jpg";
import lifeFamily from "@/assets/photos/life-family.jpg";
import mindSunset from "@/assets/photos/mind-sunset.jpg";

// CC0 stock photos; see src/assets/photos/CREDITS.md.

export const HERO_PHOTO = heroPikesPeak;
export const CHALLENGES_PHOTO = challengesSummit;

export const PATH_PHOTOS: Record<WellnessPath, { src: StaticImageData; alt: string; position: string }> = {
  body: { src: bodyStrawberries, alt: "Fresh strawberries at a market stall", position: "center 40%" },
  life: { src: lifeFamily, alt: "A father hugging his laughing daughter", position: "center 30%" },
  mind: { src: mindSunset, alt: "A woman stretching toward a sunset", position: "center 35%" },
};
