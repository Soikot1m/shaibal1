import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MapPin, Compass, CalendarDays, Search, LifeBuoy, Inbox } from "lucide-react";

type Tone = "page" | "section" | "card";

const ICONS: Record<string, LucideIcon> = {
  destinations: MapPin,
  tours: Compass,
  departures: CalendarDays,
  search: Search,
  support: LifeBuoy,
  generic: Inbox,
};

/**
 * Polished empty state. Never shows raw database errors or "0 rows".
 * `admin` switches the copy to an operator call-to-action.
 */
export function EmptyState({
  kind = "generic",
  title,
  description,
  actionLabel,
  actionHref,
  admin = false,
  tone = "section",
}: {
  kind?: keyof typeof ICONS | string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  admin?: boolean;
  tone?: Tone;
}) {
  const Icon = ICONS[kind] ?? Inbox;

  const defaults: Record<string, { t: string; d: string; a: string; h: string }> = {
    destinations: {
      t: "No destinations are available yet.",
      d: "We're preparing our destination guides. In the meantime, browse our tour packages or get in touch.",
      a: "Browse tours",
      h: "/tours",
    },
    tours: {
      t: "No tours match your search.",
      d: "Try removing a filter, or tell us what you're looking for and we'll design something around it.",
      a: "Request a custom tour",
      h: "/contact#custom",
    },
    departures: {
      t: "No departures are scheduled right now.",
      d: "New dates open regularly. Ask us and we'll prioritise the destination you have in mind.",
      a: "Ask about dates",
      h: "/contact",
    },
    search: {
      t: "Nothing matched that search.",
      d: "Check the spelling, or browse the full catalogue instead.",
      a: "View all tours",
      h: "/tours",
    },
    support: { t: "No tickets yet.", d: "Our team replies within business hours.", a: "Open a ticket", h: "/contact#support" },
    generic: { t: "Nothing here yet.", d: "Content will appear as soon as it's published.", a: "Back to home", h: "/" },
  };
  const d = defaults[kind] ?? defaults.generic;
  const adminDefaults: Record<string, { t: string; d: string }> = {
    destinations: { t: "Add your first destination.", d: "Destinations power the directory, tour links and the map." },
    tours: { t: "Create your first tour.", d: "Tours appear publicly once published." },
    departures: { t: "No departure dates yet.", d: "Add dates from the Tours tab so travellers can book." },
  };
  const ad = adminDefaults[kind];

  const Title = admin && ad ? ad.t : title || d.t;
  const Desc = admin && ad ? ad.d : description || d.d;
  const href = admin && !actionHref ? "/admin/tours" : actionHref || d.h;
  const label = admin && !actionLabel ? "Go to admin" : actionLabel || d.a;

  const box =
    tone === "card"
      ? "p-6 text-left"
      : tone === "page"
        ? "p-16 sm:p-20 text-center"
        : "p-12 sm:p-16 text-center";

  return (
    <div className={`card ${box}`}>
      <span className={`grid place-items-center rounded-xl bg-lagoon-50 dark:bg-white/5 text-lagoon-600 dark:text-lagoon-300 mx-auto ${tone === "card" ? "h-9 w-9" : "h-12 w-12"}`}>
        <Icon className={tone === "card" ? "h-4.5 w-4.5" : "h-6 w-6"} strokeWidth={1.6} />
      </span>
      <p className={`font-display font-semibold mt-4 ${tone === "card" ? "text-[0.95rem]" : "text-lg"} ${tone !== "card" ? "" : ""}`}>{Title}</p>
      <p className={`text-muted mt-1.5 ${tone === "card" ? "text-xs" : "text-sm max-w-md"} ${tone !== "card" ? "mx-auto" : ""}`}>{Desc}</p>
      {actionHref !== null && (
        <Link href={href} className={`btn btn-soft btn-sm mt-5 ${tone !== "card" ? "" : ""}`}>
          {label}
        </Link>
      )}
    </div>
  );
}
