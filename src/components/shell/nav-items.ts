import { Compass, Home, LineChart, Gift, Trophy, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Member navigation — bottom tabs on mobile, sidebar on desktop. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/rewards", label: "Rewards", icon: Gift },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
