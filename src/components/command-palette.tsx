"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, MapPin, CalendarDays, Plane, User, LifeBuoy, Sparkles, CornerDownLeft } from "lucide-react";

const COMMANDS = [
  { label: "Search tours", hint: "Browse all tour packages", href: "/tours", icon: Compass },
  { label: "Search destinations", hint: "Explore places", href: "/destinations", icon: MapPin },
  { label: "Open my bookings", hint: "Account dashboard", href: "/account", icon: CalendarDays },
  { label: "Open travel planner", hint: "Build your own itinerary", href: "/planner", icon: Plane },
  { label: "Open profile", hint: "Manage account", href: "/account?tab=profile", icon: User },
  { label: "Contact support", hint: "Tickets, WhatsApp & call", href: "/contact", icon: LifeBuoy },
  { label: "Ask Shaibal AI", hint: "Travel assistant", href: "/planner#assistant", icon: Sparkles },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const list = COMMANDS.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase()));
    if (q.trim()) list.unshift({ label: `Search tours for “${q}”`, hint: "Tour catalog", href: `/tours?q=${encodeURIComponent(q)}`, icon: Search });
    return list;
  }, [q]);

  useEffect(() => setIdx(0), [q]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg card shadow-float overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-line">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setIdx((i) => Math.min(results.length - 1, i + 1));
              if (e.key === "ArrowUp") setIdx((i) => Math.max(0, i - 1));
              if (e.key === "Enter" && results[idx]) go(results[idx].href);
            }}
            placeholder="Type a command or search…"
            className="w-full bg-transparent py-4 text-sm outline-none"
            aria-label="Command input"
          />
          <kbd className="text-[0.65rem] text-muted border border-line rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-auto p-2">
          {results.map((r, i) => (
            <li key={r.label}>
              <button
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(r.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm ${i === idx ? "bg-sky-500/12 text-sky-700 dark:text-sky-200" : ""}`}
              >
                <r.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                  <span className="font-semibold block">{r.label}</span>
                  <span className="text-xs text-muted">{r.hint}</span>
                </span>
                {i === idx && <CornerDownLeft className="h-3.5 w-3.5 text-muted" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-line text-[0.68rem] text-muted flex gap-3">
          <span>↑↓ navigate</span><span>↵ open</span><span className="ml-auto">Ctrl/⌘ + K</span>
        </div>
      </div>
    </div>
  );
}
