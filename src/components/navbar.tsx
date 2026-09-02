"use client";
import { run } from "@/lib/action";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, Compass, Plane, Home, CalendarDays, User, LogOut, LayoutDashboard, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions";
import { Logo } from "./logo";

export type NavUser = { name: string; isAdmin: boolean } | null;

const LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/planner", label: "Planner" },
  { href: "/blog", label: "Guides" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ user }: { user: NavUser; brand: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  useEffect(() => setOpen(false), [path]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("sb_theme", next ? "dark" : "light"); } catch { /* ignore */ }
  };

  const onLogout = async () => {
    await run(logout());
    router.push("/");
    router.refresh();
  };

  // Pages with a full-bleed dark hero get a transparent, light-on-dark header until scrolled.
  const heroPages = ["/", "/about", "/destinations"];
  const onHero = (heroPages.includes(path) || /^\/(tours|destinations|blog)\/[^/]+$/.test(path)) && !scrolled;
  const iconBtn = cn("grid place-items-center h-10 w-10 rounded-lg transition", onHero ? "text-white hover:bg-white/10" : "text-fg hover:bg-fg/5");

  return (
    <>
      <header className={cn("fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300", scrolled ? "bg-paper/85 backdrop-blur-md border-b border-line" : "bg-transparent border-b border-transparent")}>
        <div className="container-x h-16 lg:h-[72px] flex items-center gap-6">
          <Logo light={onHero} size={38} />

          <nav className="hidden lg:flex items-center gap-7 mx-auto" aria-label="Primary">
            {LINKS.map((l) => {
              const active = path === l.href || path.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-[13.5px] font-medium tracking-[0.01em] transition-colors py-1 border-b-2",
                    onHero ? "text-white/85 hover:text-white" : "text-muted hover:text-fg",
                    active ? (onHero ? "!text-white border-white" : "!text-fg border-accent") : "border-transparent",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            <Link href="/tours" aria-label="Search tours" className={cn(iconBtn, "hidden sm:grid")}><Search className="h-[18px] w-[18px]" /></Link>
            <button onClick={toggleTheme} aria-label="Toggle colour theme" className={iconBtn}>
              {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            {user ? (
              <Link href={user.isAdmin ? "/admin" : "/account"} className={cn("hidden md:inline-flex items-center gap-2 text-[13.5px] font-medium px-2", onHero ? "text-white" : "text-fg")}>
                <span className={cn("grid place-items-center h-8 w-8 rounded-full font-display text-sm", onHero ? "bg-white text-navy-900" : "bg-fg text-paper")}>{user.name.slice(0, 1)}</span>
                <span className="max-w-[9rem] truncate">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link href="/login" className={cn("hidden md:inline-flex text-[13.5px] font-medium px-3", onHero ? "text-white/90 hover:text-white" : "text-muted hover:text-fg")}>Sign in</Link>
            )}
            <Link href="/tours" className={cn("btn btn-sm hidden md:inline-flex ml-1", onHero ? "btn-white" : "btn-primary")}>
              Book a trip <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button className={cn(iconBtn, "lg:hidden")} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden transition-opacity duration-300", open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")} role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-navy-900" />
        <div className="relative h-full p-6 flex flex-col text-white">
          <div className="flex items-center justify-between">
            <Logo light size={40} />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid place-items-center h-11 w-11 rounded-lg border border-white/20"><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-12 flex flex-col" aria-label="Mobile">
            {[{ href: "/", label: "Home" }, ...LINKS].map((l, i) => (
              <Link key={l.href} href={l.href} className="flex items-baseline gap-4 py-3.5 border-b border-white/10 font-display text-[2rem] leading-none">
                <span className="text-xs font-sans text-white/40 w-6 tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            {user ? (
              <>
                <Link href={user.isAdmin ? "/admin" : "/account"} className="btn btn-glass"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                <button onClick={onLogout} className="btn btn-glass"><LogOut className="h-4 w-4" /> Sign out</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-glass col-span-2"><User className="h-4 w-4" /> Sign in / Create account</Link>
            )}
            <Link href="/tours" className="btn btn-white col-span-2">Book a trip <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      {/* Mobile bottom app bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-panel/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Bottom">
        <div className="relative grid grid-cols-5 h-[60px]">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/tours", icon: Compass, label: "Tours" },
            { href: "/planner", icon: Plane, label: "Plan" },
            { href: "/account?tab=bookings", icon: CalendarDays, label: "Trips" },
            { href: user ? (user.isAdmin ? "/admin" : "/account") : "/login", icon: User, label: "Account" },
          ].map((it, i) => {
            const active = i === 0 ? path === "/" : path.startsWith(it.href.split("?")[0]);
            return (
              <Link key={it.label} href={it.href} className={cn("flex flex-col items-center justify-center gap-1 text-[0.62rem] font-semibold tracking-wide", active ? "text-fg" : "text-muted")}>
                {i === 2 ? (
                  <span className="grid place-items-center h-11 w-11 -mt-6 rounded-full bg-fg text-paper shadow-float"><it.icon className="h-5 w-5" /></span>
                ) : (
                  <it.icon className="h-5 w-5" />
                )}
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
