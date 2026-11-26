import { BookOpen, ClipboardList, Library, MonitorPlay, PlayCircle, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { ContentType } from "@/lib/domain";

export const CONTENT_TYPE_META: Record<ContentType, { label: string; icon: LucideIcon }> = {
  article: { label: "Article", icon: BookOpen },
  video: { label: "Video", icon: PlayCircle },
  webinar: { label: "Webinar", icon: MonitorPlay },
  program: { label: "Program", icon: ClipboardList },
  recipe: { label: "Recipe", icon: UtensilsCrossed },
  resource: { label: "Resource", icon: Library },
};

export function contentTypeMeta(type: string) {
  return CONTENT_TYPE_META[type as ContentType] ?? CONTENT_TYPE_META.resource;
}
