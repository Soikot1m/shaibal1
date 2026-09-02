import type { NextConfig } from "next";

// Hosts allowed to invoke Server Actions. Required when the app runs behind a
// reverse proxy whose `Host` header differs from the browser's `Origin`
// (otherwise Next.js aborts every action with "Invalid Server Actions request").
const siteHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : null;
  } catch {
    return null;
  }
})();

const allowedOrigins = Array.from(
  new Set(
    [
      "localhost:3000",
      "127.0.0.1:3000",
      "*.e2b.app",
      "*.e2b.dev",
      siteHost,
      ...(process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()),
    ].filter((x): x is string => Boolean(x)),
  ),
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins, bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
