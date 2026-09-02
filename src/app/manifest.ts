import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shaibal Tours & Travels",
    short_name: "Shaibal Tours",
    description: "Explore More. Travel Better. Create Memories.",
    start_url: "/",
    display: "standalone",
    background_color: "#061c38",
    theme_color: "#061c38",
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
