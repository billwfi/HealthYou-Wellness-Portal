"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rewards", label: "Rewards" },
  { href: "/challenges", label: "Challenges" },
  { href: "/content", label: "Content" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [trackOpen, setTrackOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <Link href="/">
          <img
            src="https://www.cosreachyourpeak.com/content/themes/hycoscityco/assets/headerlogo.png"
            alt="Colorado Springs Reach Your Peak"
            className="h-16 w-auto"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.style.display = "none";
              const next = t.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }}
          />
          <span className="hidden font-bold text-blue-800 leading-tight text-sm">
            <span className="block">COLORADO SPRINGS</span>
            <span className="block text-red-600">REACH YOUR PEAK</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-blue-600 text-sm">Welcome Bill Walker</span>
          <Link href="/profile" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">BW</Link>
          <button className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white" aria-label="Search">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="bg-blue-700 flex items-center px-2 text-white text-sm relative">
        <Link href="/" className="flex items-center gap-1 px-3 py-3 hover:bg-blue-800 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 8v10h5v-6h6v6h5V8L10 2z" /></svg>
          Home
        </Link>
        {navLinks.slice(1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 hover:bg-blue-800 transition-colors ${pathname === link.href ? "bg-blue-900" : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <div className="ml-auto relative">
          <button
            onClick={() => setTrackOpen(!trackOpen)}
            className="flex items-center gap-1 px-4 py-3 bg-blue-800 hover:bg-blue-900 transition-colors font-semibold"
          >
            Track
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {trackOpen && (
            <div className="absolute right-0 top-full bg-white text-gray-800 shadow-lg rounded-b min-w-40 z-50">
              {[
                { href: "/track/dashboard", label: "Dashboard" },
                { href: "/track/activities", label: "Activities" },
                { href: "/track/biometrics", label: "Biometrics" },
                { href: "/track/goals", label: "Goals" },
                { href: "/track/teams", label: "Teams" },
                { href: "/track/challenges", label: "Challenges" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setTrackOpen(false)}
                  className="block px-4 py-2 hover:bg-blue-50 text-sm border-b last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
