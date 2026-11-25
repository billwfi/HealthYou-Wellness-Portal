import "server-only";
import { db } from "@/db";
import type { WellnessPath } from "@/lib/domain";
import { PATHS } from "@/lib/utils";
import { programToday } from "@/lib/dates";
import { getMemberContext } from "./member";

// Rule-based ranking, recomputed per request (the catalog is small). Every pick
// carries a human-readable reason so members can see why it's there.
const WEIGHTS = { featured: 100, interestMatch: 10, goalPath: 4, unseen: 1 } as const;

export type Recommendation = Awaited<ReturnType<typeof getRecommendations>>[number];

export async function getRecommendations(userId: string, { limit = 4 } = {}) {
  const [member, items] = await Promise.all([
    getMemberContext(userId),
    db.contentItem.findMany({
      where: { publishedAt: { not: null } },
      include: {
        tags: { include: { tag: true } },
        interactions: { where: { userId } },
      },
    }),
  ]);

  const today = programToday();
  const interestIds = new Set(member.interests.map((t) => t.id));
  // Keep the member's own ordering so "Because you chose…" names their first pick.
  const interestRank = new Map(member.interests.map((t, i) => [t.id, i]));

  const scored = items.flatMap((item) => {
    const interaction = item.interactions[0];
    if (interaction?.completedAt || interaction?.dismissedAt) return [];

    const path = item.path as WellnessPath;
    const matches = item.tags
      .map((ct) => ct.tag)
      .filter((t) => interestIds.has(t.id))
      .sort((a, b) => interestRank.get(a.id)! - interestRank.get(b.id)!);
    const featured =
      item.featuredFrom != null && item.featuredFrom <= today && (item.featuredUntil == null || item.featuredUntil >= today);
    const goal = member.goals[path];

    let score = matches.length * WEIGHTS.interestMatch;
    if (featured) score += WEIGHTS.featured;
    if (goal) score += WEIGHTS.goalPath;
    if (!interaction?.viewedAt) score += WEIGHTS.unseen;

    const reason = featured
      ? "Featured by Reach Your Peak"
      : matches.length
        ? `Because you chose ${matches[0].label}`
        : goal
          ? `Supports your ${PATHS[path].label} goal: ${goal}`
          : `Something new in ${PATHS[path].label}`;

    return [{ item, path, score, reason, saved: Boolean(interaction?.savedAt) }];
  });

  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  // Keep the feed varied: no more than half the picks from one path on the first pass.
  const perPathCap = Math.max(1, Math.ceil(limit / 2));
  const picked: typeof scored = [];
  const counts: Partial<Record<WellnessPath, number>> = {};
  for (const s of scored) {
    if (picked.length === limit) break;
    if ((counts[s.path] ?? 0) >= perPathCap) continue;
    picked.push(s);
    counts[s.path] = (counts[s.path] ?? 0) + 1;
  }
  for (const s of scored) {
    if (picked.length === limit) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked;
}
