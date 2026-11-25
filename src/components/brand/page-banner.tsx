import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Photo } from "./photos";

/**
 * Photo header for member pages: eyebrow, title and description over a navy
 * gradient, with the logo-color stripe underneath. The photo is decorative.
 */
export function PageBanner({
  photo,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  photo: Photo;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative isolate mb-6 overflow-hidden rounded-3xl shadow-card", className)}>
      <Image
        src={photo.src}
        alt=""
        fill
        placeholder="blur"
        sizes="(min-width: 1024px) 1100px, 100vw"
        className="-z-10 object-cover"
        style={{ objectPosition: photo.position ?? "center" }}
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-peak-navy/95 via-peak-navy/70 to-peak-navy/20" aria-hidden />
      <div className="flex min-h-40 flex-wrap items-end justify-between gap-4 p-5 text-white sm:min-h-48 sm:p-8">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-white/80">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {description && <div className="mt-1.5 text-white/85">{description}</div>}
          {children}
        </div>
        {action}
      </div>
      <div className="peak-stripe h-1.5" aria-hidden />
    </header>
  );
}
