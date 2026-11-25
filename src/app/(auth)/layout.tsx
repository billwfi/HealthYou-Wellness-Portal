import Image from "next/image";
import { Activity, HeartPulse, Trophy } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { HERO_PHOTO } from "@/components/brand/photos";

const highlights = [
  { icon: HeartPulse, text: "Content picked for your interests across Body, Life and Mind" },
  { icon: Trophy, text: "Team and individual challenges with live leaderboards" },
  { icon: Activity, text: "Track activity, habits and screenings, and earn rewards" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative isolate hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <Image src={HERO_PHOTO} alt="" fill priority placeholder="blur" sizes="50vw" className="-z-10 object-cover object-[center_40%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-peak-navy via-peak-navy/75 to-peak-navy/20" aria-hidden />
        <div className="self-start rounded-2xl bg-white px-4 py-3 shadow-md">
          <Logo size="lg" className="dark:bg-transparent dark:p-0" />
        </div>
        <div className="mt-auto max-w-md pb-10">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">Your wellbeing, your way.</h1>
          <p className="mt-3 text-lg text-white/85">The City of Colorado Springs wellness program for employees and their families.</p>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-white/90">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="peak-stripe absolute inset-x-0 bottom-0 h-1.5" aria-hidden />
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
