"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, MapPin, Calendar, Users, Compass, Search } from "lucide-react";
import { HERO_IMAGES } from "@/lib/images";

const STATS = [
  { n: "100+", l: "Happy travelers" },
  { n: "50+", l: "Tour experiences" },
  { n: "20+", l: "Destinations" },
  { n: "24/7", l: "Trip support" },
];

const CAPTIONS = ["Sunrise over the hill tracts", "Sea of clouds, Sajek Valley", "Long beach, Cox's Bazar", "Tea country, Sreemangal", "Golden hour, Bay of Bengal"];

export function Hero({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [img, setImg] = useState(0);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("Any style");
  const [travelers, setTravelers] = useState("2");
  const [date, setDate] = useState("");

  useEffect(() => {
    const id = setInterval(() => setImg((p) => (p + 1) % HERO_IMAGES.length), 8000);
    return () => clearInterval(id);
  }, []);

  const goSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type !== "Any style") params.set("type", type);
    if (date) params.set("date", date);
    params.set("travelers", travelers);
    router.push(`/tours?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-navy-900 text-white">
      {HERO_IMAGES.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1800ms] ease-out" style={{ opacity: i === img ? 1 : 0 }} aria-hidden={i !== img}>
          <img src={src} alt="" className={`h-full w-full object-cover ${i === img ? "kenburns" : ""}`} fetchPriority={i === 0 ? "high" : "low"} />
        </div>
      ))}
      <div className="absolute inset-0 hero-overlay" />

      {/* Headline */}
      <div className="relative z-10 container-x flex-1 flex flex-col justify-center pt-28 pb-10">
        <div className="max-w-4xl">
          <p className="eyebrow !text-white/70 mb-6"><MapPin className="h-3.5 w-3.5" /> Tour operator · Bogura, Bangladesh</p>
          <h1 className="text-[2.9rem] leading-[0.98] sm:text-[4.2rem] lg:text-[5.4rem]">
            {title ? title : (
              <>
                Explore more.
                <br />
                Travel better.
                <br />
                <em style={{ color: "#EAD9B1" }}>Create memories.</em>
              </>
            )}
          </h1>
          <p className="mt-7 max-w-xl text-[1.05rem] sm:text-lg text-white/80 leading-relaxed">
            {subtitle || "Considered journeys across the hills, coasts and tea country of Bangladesh — and hand-picked escapes beyond its borders. Planned end to end, tracked live."}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/tours" className="btn btn-white btn-lg">Explore tours <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/planner" className="btn btn-glass btn-lg">Plan my trip</Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white px-2">Talk to us <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-8 text-[0.68rem] uppercase tracking-[0.18em] text-white/50">Domestic · International · Custom itineraries · Group travel</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative z-10 container-x">
        <form onSubmit={goSearch} className="bg-white text-navy-900 rounded-xl shadow-float p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]" role="search" aria-label="Search tours">
          <label className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
            <Compass className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gray-500">Destination</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bandarban, Cox's Bazar, Nepal…" className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400" />
            </span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 lg:border-r border-gray-200">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gray-500">Travel style</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
                {["Any style", "Adventure", "Beach", "Mountains", "Nature", "Cultural", "International", "Custom"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gray-500">Travel date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none" />
            </span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3">
            <Users className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gray-500">Travelers</span>
              <select value={travelers} onChange={(e) => setTravelers(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
                {["1", "2", "3", "4", "5", "6+", "Group (10+)"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </span>
          </label>
          <button type="submit" className="btn btn-primary m-1 sm:col-span-2 lg:col-span-1 h-[52px] px-6"><Search className="h-4 w-4" /> Search tours</button>
        </form>
      </div>

      {/* Stats */}
      <div className="relative z-10 container-x pt-8 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/15 pt-6">
          {STATS.map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl sm:text-4xl leading-none">{s.n}</p>
              <p className="mt-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-white/55">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center justify-between mt-6 text-[0.68rem] uppercase tracking-[0.14em] text-white/45">
          <span>{CAPTIONS[img % CAPTIONS.length]}</span>
          <span className="flex items-center gap-3">Scroll <span className="scroll-cue !h-8" /></span>
        </div>
      </div>
    </section>
  );
}
