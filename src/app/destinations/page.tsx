import Link from "next/link";
import { getDestinations } from "@/lib/data";
import { DestinationCard } from "@/components/cards";
import { SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { IMG } from "@/lib/images";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Destinations", description: "Explore Bangladesh and international destinations with Shaibal Tours & Travels." };

const TYPES = ["All", "Mountains", "Beach", "Adventure", "Nature", "Cultural", "International"];
const BUDGETS = [
  { k: "All", label: "Any budget" },
  { k: "low", label: "Under ৳8,000" },
  { k: "mid", label: "৳8,000 – ৳20,000" },
  { k: "high", label: "৳20,000+" },
];

export default async function DestinationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const type = sp.type || "All";
  const budget = sp.budget || "All";
  const country = sp.country || "All";
  const q = (sp.q || "").toLowerCase();
  const all = await getDestinations();
  const countries = ["All", ...Array.from(new Set(all.map((d) => d.country)))];

  const list = all
    .filter((d) => type === "All" || d.type === type)
    .filter((d) => country === "All" || d.country === country)
    .filter((d) => {
      const b = d.budget || 0;
      if (budget === "low") return b < 8000;
      if (budget === "mid") return b >= 8000 && b <= 20000;
      if (budget === "high") return b > 20000;
      return true;
    })
    .filter((d) => !q || d.name.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string> = { type, budget, country, q };
    Object.assign(cur, extra);
    Object.entries(cur).forEach(([k, v]) => v && v !== "All" && p.set(k, v));
    return `/destinations?${p.toString()}`;
  };

  return (
    <div>
      <section className="relative h-[46vh] min-h-[340px] flex items-end">
        <img src={IMG.cloudMountains} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-x relative pb-10 text-white">
          <p className="chip !bg-white/15 !text-white mb-3">Destination directory</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl">Where will your story begin?</h1>
          <p className="mt-3 text-white/85 max-w-xl">Hills, beaches, forests and cities across Bangladesh — plus hand-picked international escapes.</p>
        </div>
      </section>

      <div className="container-x py-10">
        <div className="card p-4 mb-8 space-y-3 sticky top-[72px] z-30 bg-panel/95 backdrop-blur">
          <form action="/destinations" className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search destinations…" className="input" aria-label="Search destinations" />
            <button className="btn btn-primary btn-sm">Search</button>
          </form>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-muted font-semibold mr-1">Style</span>
            {TYPES.map((t) => <Link key={t} href={qs({ type: t })} className={`chip ${type === t ? "chip-active" : ""}`}>{t}</Link>)}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-muted font-semibold mr-1">Budget</span>
            {BUDGETS.map((b) => <Link key={b.k} href={qs({ budget: b.k })} className={`chip ${budget === b.k ? "chip-active" : ""}`}>{b.label}</Link>)}
            <span className="text-muted font-semibold ml-3 mr-1">Country</span>
            {countries.map((c) => <Link key={c} href={qs({ country: c })} className={`chip ${country === c ? "chip-active" : ""}`}>{c}</Link>)}
          </div>
        </div>

        <SectionHeading align="left" title={`${list.length} destination${list.length === 1 ? "" : "s"}`} className="!mb-6" />
        {list.length === 0 ? (
          <EmptyState kind="search" title="Nothing matched those filters." description="Try widening the budget range or clearing the style filter." actionLabel="Reset all filters" actionHref="/destinations" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {list.map((d, i) => <Reveal key={d.id} delay={(i % 4) * 0.05}><DestinationCard dest={d} /></Reveal>)}
          </div>
        )}
      </div>
    </div>
  );
}
