import { Suspense } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { getPublishedTours, getTourDates } from "@/lib/data";
import { TourCard } from "@/components/cards";
import { SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion";

const CATEGORIES = ["All", "Adventure", "Beach", "Mountains", "Nature", "Cultural", "International", "Custom"];
const SORTS = ["Recommended", "price-low", "price-high", "rating"];

export const metadata = { title: "Tours & Packages", description: "Browse Bangladesh and international tour packages by Shaibal Tours & Travels." };

export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q || "").toLowerCase();
  const cat = sp.type || sp.category || "All";
  const sort = sp.sort || "Recommended";
  const diff = sp.difficulty || "All";

  const all = await getPublishedTours();
  const withDates = await Promise.all(all.map(async (t) => ({ t, dates: await getTourDates(t.id) })));
  const tours = withDates.map((x) => x.t);

  let filtered = tours.filter((t) => {
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || (t.subtitle || "").toLowerCase().includes(q);
    const matchCat = cat === "All" || t.category === cat;
    const matchDiff = diff === "All" || t.difficulty === diff;
    return matchQ && matchCat && matchDiff;
  });

  if (sort === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat !== "All") p.set("type", cat);
    if (diff !== "All") p.set("difficulty", diff);
    Object.entries(extra).forEach(([k, v]) => (v && v !== "All" ? p.set(k, v) : p.delete(k)));
    return `/tours?${p.toString()}`;
  };

  return (
    <div className="pt-28 pb-10">
      <div className="container-x">
        <SectionHeading eyebrow="Tour catalogue" index="Tours" title={<>Find your next <em>journey.</em></>} sub="Filter by style, difficulty and price. Every departure shows live seat availability." />

        {/* search + filters */}
        <div className="card p-4 mb-8 sticky top-[72px] z-30 bg-panel/95 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <form action="/tours" className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input name="q" defaultValue={q} placeholder="Search tours, destinations..." className="input pl-9" aria-label="Search tours" />
              </div>
              <button className="btn btn-primary btn-sm" type="submit">Search</button>
            </form>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-muted hidden sm:block" />
              <span className="text-muted">Sort:</span>
              {SORTS.map((s) => (
                <Link key={s} href={qs({ sort: s })} className={`chip ${sort === s ? "chip-active" : ""}`}>{s.replace(/-/g, " ")}</Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 no-scrollbar overflow-x-auto">
            {CATEGORIES.map((c) => (
              <Link key={c} href={qs({ type: c, sort })} className={`chip ${cat === c ? "chip-active" : ""}`}>{c}</Link>
            ))}
            <span className="mx-1 text-muted">·</span>
            {["Easy", "Moderate", "Challenging"].map((d) => (
              <Link key={d} href={qs({ difficulty: d, sort })} className={`chip ${diff === d ? "chip-active" : ""}`}>{d}</Link>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted mb-6">{filtered.length} tour{filtered.length === 1 ? "" : "s"} available</p>

        {filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <p className="font-display font-bold text-xl">No tours match your search</p>
            <p className="text-sm text-muted mt-2">Try clearing filters or browse all tours.</p>
            <Link href="/tours" className="btn btn-primary mt-5">Clear filters</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<p>Loading…</p>}>
              {filtered.map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 0.05}><TourCard tour={t} /></Reveal>
              ))}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
