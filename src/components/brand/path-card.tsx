import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { WellnessPath } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { PATH_PHOTOS } from "./photos";

// Static class names per path so Tailwind can see them.
const TINT: Record<WellnessPath, string> = {
  body: "from-[#073e44]/95 via-[#073e44]/80",
  life: "from-[#5a3104]/95 via-[#5a3104]/80",
  mind: "from-[#2a1f66]/95 via-[#2a1f66]/80",
};
const CHIP: Record<WellnessPath, string> = {
  body: "bg-[#0b6b74]",
  life: "bg-[#975208]",
  mind: "bg-[#5b48c2]",
};

/** Photo card for a wellness path, showing the member's goal when they have one. */
export function PathCard({ path, goal }: { path: WellnessPath; goal?: string }) {
  const photo = PATH_PHOTOS[path];
  return (
    <Link
      href={`/explore?path=${path}`}
      className="group relative isolate flex min-h-44 flex-col justify-end sm:min-h-60 overflow-hidden rounded-card shadow-card transition-shadow hover:shadow-pop focus-visible:outline-offset-4"
    >
      <Image
        src={photo.src}
        alt=""
        fill
        sizes="(min-width: 640px) 33vw, 100vw"
        placeholder="blur"
        className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ objectPosition: photo.position }}
      />
      <div className={`absolute inset-0 -z-10 bg-linear-to-t ${TINT[path]} to-transparent`} aria-hidden />
      <div className="p-5 text-white">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${CHIP[path]}`}>{PATHS[path].label}</span>
        {goal ? (
          <p className="mt-3 flex items-start gap-2 text-lg font-bold leading-snug">
            <Target className="mt-1 size-4 shrink-0 opacity-80" aria-hidden />
            <span>
              <span className="sr-only">Your {PATHS[path].label} goal: </span>
              {goal}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-lg font-bold leading-snug">{PATHS[path].tagline}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90">
          Explore {PATHS[path].label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
