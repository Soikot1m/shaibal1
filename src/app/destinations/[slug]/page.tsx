import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinationBySlug, getToursForDestination } from "@/lib/data";
import { TourCard } from "@/components/cards";
import { SectionHeading } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Wallet, MapPin, Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestinationBySlug(slug);
  if (!d) return { title: "Destination not found" };
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const title = `${d.name} — ${d.headline || "Destination guide"}`;
  const desc = (d.description || "").slice(0, 155);
  return {
    title,
    description: desc,
    alternates: { canonical: `${base}/destinations/${d.slug}` },
    openGraph: { title, description: desc, images: d.image ? [d.image] : undefined, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();
  const tours = await getToursForDestination(dest.id);
  const gallery = dest.gallery || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Place", name: dest.name, description: dest.description || "", url: `${siteUrl}/destinations/${dest.slug}`, image: dest.image || undefined,
        geo: dest.lat && dest.lng ? { "@type": "GeoCoordinates", latitude: dest.lat, longitude: dest.lng } : undefined },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Destinations", item: `${siteUrl}/destinations` },
        { "@type": "ListItem", position: 3, name: dest.name, item: `${siteUrl}/destinations/${dest.slug}` },
      ] },
    ],
  };
  const mapUrl = dest.lat && dest.lng ? `https://www.openstreetmap.org/export/embed.html?bbox=${dest.lng - 0.6}%2C${dest.lat - 0.4}%2C${dest.lng + 0.6}%2C${dest.lat + 0.4}&layer=mapnik&marker=${dest.lat}%2C${dest.lng}` : null;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative h-[70vh] min-h-[460px] flex items-end">
        <img src={dest.image || ""} alt={dest.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-x relative pb-12 text-white">
          <Link href="/destinations" className="chip !bg-white/15 !text-white mb-4">← All destinations</Link>
          <p className="text-sky-200 font-semibold uppercase tracking-[0.25em] text-xs">{dest.country} · {dest.region}</p>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl mt-2 uppercase">{dest.name}</h1>
          {dest.headline && <p className="font-display text-2xl sm:text-3xl text-white/90 mt-1">“{dest.headline}”</p>}
        </div>
      </section>

      <section className="container-x py-12 grid lg:grid-cols-[1fr_340px] gap-10">
        <div>
          <SectionHeading align="left" eyebrow="The story" title={`Discover ${dest.name}`} className="!mb-4" />
          <p className="text-muted leading-relaxed text-lg">{dest.description}</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            <div className="card p-4"><Calendar className="h-5 w-5 text-sky-500 mb-2" /><p className="text-xs text-muted">Best time</p><p className="font-bold">{dest.bestTime}</p></div>
            <div className="card p-4"><Wallet className="h-5 w-5 text-sky-500 mb-2" /><p className="text-xs text-muted">Estimated budget</p><p className="font-bold">from {formatCurrency(dest.budget)}</p></div>
            <div className="card p-4"><MapPin className="h-5 w-5 text-sky-500 mb-2" /><p className="text-xs text-muted">Tours available</p><p className="font-bold">{tours.length}</p></div>
          </div>
          {(dest.activities || []).length > 0 && (
            <div className="mt-8">
              <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Popular activities</h3>
              <div className="flex flex-wrap gap-2">{(dest.activities || []).map((a) => <span key={a} className="chip">{a}</span>)}</div>
            </div>
          )}
          {(dest.travelTips || []).length > 0 && (
            <div className="mt-8 card p-6">
              <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-sand-400" /> Travel tips</h3>
              <ul className="space-y-2.5 text-sm text-muted">
                {(dest.travelTips || []).map((tip) => <li key={tip} className="flex gap-2.5"><span className="text-accent mt-0.5">•</span>{tip}</li>)}
              </ul>
            </div>
          )}
          {gallery.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3">
              {gallery.map((g, i) => <img key={i} src={g} alt={`${dest.name} ${i + 1}`} loading="lazy" className={`w-full object-cover rounded-2xl ${i === 0 ? "col-span-2 h-64" : "h-40"}`} />)}
            </div>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          {mapUrl && (
            <div className="card overflow-hidden">
              <iframe title={`Map of ${dest.name}`} src={mapUrl} className="w-full h-56 border-0" loading="lazy" />
              <p className="text-[0.68rem] text-muted p-3">Map data © OpenStreetMap contributors. Mapbox/Google Maps can be enabled via env keys.</p>
            </div>
          )}
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg">Plan a trip here</h3>
            <p className="text-sm text-muted mt-1">Pick a ready package or request a custom itinerary.</p>
            <Link href={`/tours?q=${encodeURIComponent(dest.name.split(",")[0])}`} className="btn btn-primary w-full mt-4">See tours <ArrowRight className="h-4 w-4" /></Link>
            <Link href={`/planner?destination=${encodeURIComponent(dest.name)}`} className="btn btn-ghost w-full mt-2">Open planner</Link>
          </div>
        </aside>
      </section>

      {tours.length > 0 && (
        <section className="container-x pb-16">
          <SectionHeading align="center" eyebrow="Packages" title={`Tours to ${dest.name.split(",")[0]}`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{tours.map((t) => <TourCard key={t.id} tour={t} />)}</div>
        </section>
      )}
    </div>
  );
}
