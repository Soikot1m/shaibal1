import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SiteSettings {
  brand: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  announcement: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: "Shaibal Tours & Travels",
  tagline: "Explore More. Travel Better. Create Memories.",
  heroTitle: "Explore More. Travel Better. Create Memories.",
  heroSubtitle:
    "From the hills of Bandarban to the shores of Cox's Bazar — premium, thoughtfully-planned journeys across Bangladesh and beyond.",
  phone: "[Phone Number]",
  whatsapp: "[WhatsApp Number]",
  email: "[Business Email]",
  address: "Bogura, Bangladesh",
  hours: "9:00 AM – 9:00 PM (Everyday)",
  facebook: "#",
  instagram: "#",
  youtube: "#",
  tiktok: "#",
  announcement: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, "site"));
    if (!rows.length) return DEFAULT_SETTINGS;
    const raw = rows[0].value as Partial<SiteSettings>;
    return { ...DEFAULT_SETTINGS, ...(raw || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSiteSettings(next: SiteSettings) {
  await db
    .insert(settings)
    .values({ key: "site", value: next as unknown as object })
    .onConflictDoUpdate({ target: settings.key, set: { value: next as unknown as object } });
}

export async function getSetting(key: string) {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value;
}

export async function setSetting(key: string, value: unknown) {
  await db
    .insert(settings)
    .values({ key, value: value as object })
    .onConflictDoUpdate({ target: settings.key, set: { value: value as object } });
}
