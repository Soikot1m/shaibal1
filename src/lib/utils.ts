import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatCurrency(amount: number | null | undefined, currency = "BDT") {
  const n = Math.round(Number(amount || 0));
  if (currency === "BDT") return `৳${n.toLocaleString("en-IN")}`;
  return `${currency} ${n.toLocaleString("en-US")}`;
}

export function formatDate(input: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function timeAgo(input: string | Date) {
  const d = new Date(input).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(input);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}

export function addDays(base: Date | string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// A stable, human-friendly route name for demo purposes.
export const CONTACT = {
  name: "Shaibal Tours & Travels",
  location: "Bogura, Bangladesh",
  phone: "[Phone Number]",
  whatsapp: "[WhatsApp Number]",
  email: "[Business Email]",
  address: "[Office Address]",
  hours: "9:00 AM – 9:00 PM (Everyday)",
};

// Demo banner text so users understand seed data.
export const DEMO_NOTICE =
  "Demo content. Data shown is for demonstration purposes and editable from the admin panel.";
