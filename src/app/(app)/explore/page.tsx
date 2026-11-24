import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PATHS, type WellnessPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Explore" };

/** Until Phase 1 moves this content into the database, link to the legacy pages. */
const LINKS: Record<WellnessPath, { label: string; href: string }[]> = {
  body: [
    { label: "Body overview", href: "/legacy/body" },
    { label: "Health coaching", href: "/legacy/body/health-coaching" },
    { label: "Biometric screening", href: "/legacy/body/biometric-screening" },
    { label: "UCCS programs", href: "/legacy/body/uccs-programs" },
    { label: "Food & Mood resources", href: "/legacy/body/food-mood-resources" },
  ],
  life: [{ label: "Life overview", href: "/legacy/life" }],
  mind: [{ label: "Mind overview", href: "/legacy/mind" }],
};

export default function ExplorePage() {
  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Body, Life & Mind"
        description="Programs, coaching and resources across the three Reach Your Peak paths."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(PATHS) as WellnessPath[]).map((path) => (
          <Card key={path} id={path} className="scroll-mt-24 p-5">
            <Badge tone={path}>{PATHS[path].label}</Badge>
            <p className="mt-3 font-semibold">{PATHS[path].tagline}</p>
            <ul className="mt-4 divide-y divide-border">
              {LINKS[path].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center justify-between py-2.5 text-sm font-medium text-ink-muted hover:text-primary">
                    {l.label} <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-subtle">These links open the original pages while their content moves into the new design.</p>
    </>
  );
}
