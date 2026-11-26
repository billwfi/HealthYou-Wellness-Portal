import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "@/assets/brand/reach-your-peak.png";

/**
 * The official Colorado Springs Reach Your Peak logo (164×98 source, so keep it
 * at 56px tall or less to stay sharp on high-density screens). Its lettering is
 * dark, so in dark mode it sits on a white tile.
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const h = { sm: 36, md: 44, lg: 56 }[size];
  return (
    <span className={cn("inline-flex dark:rounded-lg dark:bg-white dark:px-1.5 dark:py-1", className)}>
      <Image src={logo} alt="Colorado Springs Reach Your Peak" height={h} style={{ width: "auto", height: h }} priority />
    </span>
  );
}
