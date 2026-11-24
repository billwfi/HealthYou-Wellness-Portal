"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/legacy/track/dashboard", label: "Dashboard" },
  { href: "/legacy/track/activities", label: "Activities" },
  { href: "/legacy/track/biometrics", label: "Biometrics" },
  { href: "/legacy/track/goals", label: "Goals" },
  { href: "/legacy/track/teams", label: "Teams" },
  { href: "/legacy/track/challenges", label: "Challenges" },
];

export default function TrackSubNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-blue-800 flex items-center px-2 text-white text-sm overflow-x-auto">
      <Link href="/legacy/" className="flex items-center gap-1 px-3 py-2 hover:bg-blue-900 shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 8v10h5v-6h6v6h5V8L10 2z" /></svg>
        Home
      </Link>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 hover:bg-blue-900 shrink-0 transition-colors border-b-2 ${pathname === tab.href ? "border-white font-semibold" : "border-transparent"}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
