import { Activity, HeartPulse, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  { icon: HeartPulse, text: "Content picked for your interests across Body, Life and Mind" },
  { icon: Trophy, text: "Team and individual challenges with live leaderboards" },
  { icon: Activity, text: "Track activity, habits and screenings — and earn rewards" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#13204f] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-30" aria-hidden>
          <svg viewBox="0 0 800 300" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 300 L180 110 L270 200 L400 40 L520 180 L610 120 L800 300 Z" fill="#1565c0" />
            <path d="M400 40 L440 95 L400 80 L370 100 Z" fill="#cc0000" />
          </svg>
        </div>
        <div className="relative rounded-2xl bg-white/95 px-4 py-3 self-start">
          <Logo />
        </div>
        <div className="relative mt-auto max-w-md pb-24">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">Your wellbeing, your way.</h1>
          <p className="mt-3 text-lg text-white/80">
            The City of Colorado Springs wellness program for employees and their families.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-white/90">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
