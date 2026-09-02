import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/lib/content";
import { Newsletter } from "./newsletter";
import { Logo } from "./logo";

const cols = [
  {
    h: "Tours",
    links: [
      { label: "Bandarban Adventure", href: "/tours/bandarban-adventure" },
      { label: "Cox's Bazar Escape", href: "/tours/coxs-bazar-escape" },
      { label: "Sajek Valley Experience", href: "/tours/sajek-valley-experience" },
      { label: "Sundarbans Expedition", href: "/tours/sundarbans-expedition" },
      { label: "Nepal & Thailand", href: "/tours?type=International" },
      { label: "All tours", href: "/tours" },
    ],
  },
  {
    h: "Destinations",
    links: [
      { label: "Bandarban", href: "/destinations/bandarban" },
      { label: "Cox's Bazar", href: "/destinations/coxs-bazar" },
      { label: "Sajek Valley", href: "/destinations/sajek-valley" },
      { label: "Sylhet & Sreemangal", href: "/destinations/sylhet" },
      { label: "Sundarbans", href: "/destinations/sundarbans" },
      { label: "All destinations", href: "/destinations" },
    ],
  },
  {
    h: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Travel guides", href: "/blog" },
      { label: "Gallery", href: "/gallery" },
      { label: "Travel planner", href: "/planner" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/contact#support" },
    ],
  },
  {
    h: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Cancellation policy", href: "/cancellation-policy" },
      { label: "Cookie policy", href: "/cookie-policy" },
    ],
  },
];

export default async function Footer() {
  const s = await getSiteSettings();
  return (
    <footer className="bg-navy-900 text-white mt-24">
      <div className="container-x pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr] lg:gap-20 pb-14 border-b border-white/10">
          <div>
            <Logo light size={44} />
            <p className="mt-6 font-display text-2xl leading-snug text-white/90 max-w-sm">Explore more. Travel better. <em className="!text-sand-300">Create memories.</em></p>
            <p className="mt-4 text-sm text-white/55 max-w-sm leading-relaxed">A Bogura-based tour operator planning considered journeys across Bangladesh and beyond — with live trip tracking and transparent pricing.</p>
            <div className="mt-8">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/50 mb-3">Newsletter</p>
              <Newsletter />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((c) => (
              <div key={c.h}>
                <h4 className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/50 mb-5">{c.h}</h4>
                <ul className="space-y-3 text-[0.9rem] text-white/80">
                  {c.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 py-10 border-b border-white/10 text-sm">
          {[
            { icon: Phone, l: "Phone", v: s.phone },
            { icon: Mail, l: "Email", v: s.email },
            { icon: MapPin, l: "Office", v: s.address },
            { icon: Clock, l: "Hours", v: s.hours },
          ].map((it) => (
            <div key={it.l} className="flex gap-3">
              <it.icon className="h-4 w-4 text-sand-300 mt-0.5 shrink-0" />
              <div><p className="text-[0.66rem] uppercase tracking-[0.14em] text-white/45">{it.l}</p><p className="text-white/85 mt-0.5">{it.v}</p></div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 text-xs text-white/45">
          <p>© {new Date().getFullYear()} {s.brand}. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            {[["Facebook", s.facebook], ["Instagram", s.instagram], ["YouTube", s.youtube], ["TikTok", s.tiktok]].map(([n, h]) => (
              <a key={n} href={h || "#"} className="inline-flex items-center gap-1 hover:text-white transition-colors">{n} <ArrowUpRight className="h-3 w-3" /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
