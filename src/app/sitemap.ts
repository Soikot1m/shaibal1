import type { MetadataRoute } from "next";
import { db } from "@/db";
import { tours, destinations, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticPages = ["", "/tours", "/destinations", "/planner", "/blog", "/gallery", "/about", "/contact", "/privacy-policy", "/terms", "/refund-policy", "/cancellation-policy", "/cookie-policy"];
  try {
    const [t, d, b] = await Promise.all([
      db.select({ slug: tours.slug, createdAt: tours.createdAt }).from(tours).where(eq(tours.status, "published")),
      db.select({ slug: destinations.slug, createdAt: destinations.createdAt }).from(destinations),
      db.select({ slug: blogPosts.slug, createdAt: blogPosts.createdAt }).from(blogPosts).where(eq(blogPosts.published, true)),
    ]);
    return [
      ...staticPages.map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
      ...t.map((x) => ({ url: `${base}/tours/${x.slug}`, lastModified: x.createdAt || new Date(), changeFrequency: "weekly" as const, priority: 0.9 })),
      ...d.map((x) => ({ url: `${base}/destinations/${x.slug}`, lastModified: x.createdAt || new Date(), changeFrequency: "monthly" as const, priority: 0.8 })),
      ...b.map((x) => ({ url: `${base}/blog/${x.slug}`, lastModified: x.createdAt || new Date(), changeFrequency: "monthly" as const, priority: 0.6 })),
    ];
  } catch {
    return staticPages.map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
  }
}
