import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Reach Your Peak",
    short_name: "Reach Your Peak",
    description: "City of Colorado Springs employee wellness program",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#0b1f4d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Log activity", url: "/progress#log", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Challenges", url: "/challenges", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
