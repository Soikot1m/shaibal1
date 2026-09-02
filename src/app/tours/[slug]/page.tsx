import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { reviews, favorites } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { SaveButton } from "@/components/account-widgets";
import { getTourBySlug, getTourDates, getFeaturedTours } from "@/lib/data";
import { TourCard } from "@/components/cards";
import { SectionHeading, StarRating, StatusBadge } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { FaqAccordion } from "@/components/faq-accordion";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Check, X, Clock, Users, MapPin, CalendarDays, Route as RouteIcon } from "lucide-react";

export default async function TourDetail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ date?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();
  const highlights = tour.highlights ?? [];
  const included = tour.included ?? [];
  const excluded = tour.excluded ?? [];
  const itinerary = tour.itinerary ?? [];
  const user = await getSessionUser();
  const [dates, related, tourReviews, favRows] = await Promise.all([
    getTourDates(tour.id),
    getFeaturedTours(),
    db
      .select()
      .from(reviews)
      .where(and(eq(reviews.tourId, tour.id), eq(reviews.status, "featured"))),
    user ? db.select().from(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.entityId, tour.id))) : Promise.resolve([]),
  ]);
  const isSaved = favRows.length > 0;

  const img = tour.images?.[0] || "";
  const gallery = tour.images?.slice(1) || [];
  const effPrice = tour.discountPrice && tour.discountPrice > 0 ? tour.discountPrice : tour.price;
  const isCustom = tour.price === 0;
  const upcoming = dates.filter((d) => d.date > new Date());
  const selectedDate = sp.date ? new Date(sp.date) : upcoming[0]?.date;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[62vh] min-h-[420px] flex items-end">
        <img src={img} alt={tour.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-x relative text-white pb-8">
          <Link href="/tours" className="chip !bg-white/15 !text-white !text-xs mb-3">← All tours</Link>
          <div className="flex items-center gap-2 flex-wrap text-sm mb-2">
            <StatusBadge status={tour.category} />
            <span className="flex items-center gap-1 text-white/80"><MapPin className="h-4 w-4" /> {tour.departureCity}</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl">{tour.title}</h1>
          <p className="mt-2 text-white/85 max-w-xl">{tour.subtitle}</p>
        </div>
      </section>

      {/* body */}
      <section className="container-x grid lg:grid-cols-[1fr_360px] gap-10 py-12">
        <div>
          <div className="flex flex-wrap gap-6 p-5 card mb-6 text-sm">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-sky-500" /> {tour.durationDays}D {tour.durationNights}N</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-500" /> Max {tour.groupSize} people</span>
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-500" /> Departure {tour.departureCity}</span>
            <span className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-sky-500" /> {tour.difficulty}</span>
            <StarRating value={tour.rating || 5} />
            <span className="text-sm font-semibold">{(tour.rating || 0).toFixed(1)}</span>
          </div>

          <SectionHeading align="left" eyebrow="Overview" title="About this tour" className="!mb-5" />
          <p className="text-muted leading-relaxed">{tour.description}</p>

          {highlights.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display font-bold text-xl mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => <span key={h} className="chip">{h}</span>)}
              </div>
            </div>
          )}

          {/* itinerary */}
          <div className="mt-8">
            <h3 className="font-display font-bold text-xl mb-4">Day-by-day itinerary</h3>
            {itinerary.length ? (
              <ol className="space-y-0 border-l border-sky-200 dark:border-sky-800 ml-3">
                {itinerary.map((day) => (
                  <li key={day.day} className="relative pl-8 pb-6 last:pb-0">
                    <span className="absolute -left-[7px] top-0 h-3.5 w-3.5 rounded-full gradient-brand ring-4 ring-white dark:ring-navy-900" />
                    <span className="chip !text-xs mb-1">Day {day.day}</span>
                    <h4 className="font-semibold">{day.title}</h4>
                    <p className="text-sm text-muted mt-1">{day.activity}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted">
                      <span>🏨 {day.overnight || "—"}</span>
                      <span>🍽 {day.meals || "—"}</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted text-sm">Custom itinerary designed for you after your request.</p>
            )}
          </div>

          {/* included / excluded */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-300"><Check className="h-4 w-4" /> What's included</h4>
              <ul className="space-y-2 text-sm text-muted">
                {(included || []).map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />{x}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-rose-500"><X className="h-4 w-4" /> Not included</h4>
              <ul className="space-y-2 text-sm text-muted">
                {(excluded || []).map((x) => <li key={x} className="flex gap-2"><X className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />{x}</li>)}
              </ul>
            </div>
          </div>

          {/* dates */}
          <div className="mt-8">
            <h3 className="font-display font-bold text-xl mb-3">Available departure dates</h3>
            {upcoming.length ? (
              <div className="flex flex-wrap gap-2">
                {upcoming.map((d) => {
                  const seats = (d.seatsTotal || 0) - (d.seatsBooked || 0);
                  return (
                    <Link key={d.id} href={`/booking/${tour.slug}?date=${d.date.toISOString().split("T")[0]}`} className="card px-4 py-3 hover:shadow-float transition block">
                      <span className="font-semibold">{formatDate(d.date)}</span>
                      <span className="block text-xs text-muted mt-0.5">{seats} seats left · {formatCurrency(d.price || effPrice)}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted text-sm card p-4">New departures are being scheduled — contact us to request your preferred date.</p>
            )}
          </div>

          {/* gallery */}
          {gallery.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display font-bold text-xl mb-3">Gallery</h3>
              <div className="grid grid-cols-3 gap-3">
                {[img, ...gallery].map((g, i) => <img key={i} src={g} alt={`${tour.title} ${i + 1}`} loading="lazy" className="h-28 sm:h-36 w-full object-cover rounded-2xl" />)}
              </div>
            </div>
          )}

          {/* reviews */}
          {tourReviews.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display font-bold text-xl mb-4">Traveler reviews</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {tourReviews.map((r) => (
                  <figure key={r.id} className="card p-5">
                    <StarRating value={r.rating} />
                    <blockquote className="text-sm text-muted mt-2">“{r.content}”</blockquote>
                    <figcaption className="mt-3 text-sm font-semibold">— {r.author}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          {(tour.faq || []).length > 0 && (
            <div className="mt-10">
              <h3 className="font-display font-bold text-xl mb-4">Tour FAQ</h3>
              <FaqAccordion items={(tour.faq || []).map((f) => ({ question: f.q, answer: f.a }))} />
            </div>
          )}
        </div>

        {/* booking panel */}
        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="card p-6 shadow-float">
            <p className="text-sm text-muted">From</p>
            {isCustom ? (
              <p className="font-display font-extrabold text-3xl">Custom quote</p>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="font-display font-extrabold text-3xl">{formatCurrency(effPrice)}</p>
                {tour.discountPrice && <p className="text-sm text-muted line-through">{formatCurrency(tour.price)}</p>}
              </div>
            )}
            <p className="text-xs text-muted mt-1">per person</p>
            <div className="divider my-4" />
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><Clock className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" /> {tour.durationDays} days / {tour.durationNights} nights</li>
              <li className="flex gap-2"><MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" /> Departs from {tour.departureCity}</li>
              <li className="flex gap-2"><CalendarDays className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" /> {selectedDate ? formatDate(selectedDate) : "Flexible dates"}</li>
              <li className="flex gap-2"><Users className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" /> Group size up to {tour.groupSize}</li>
            </ul>
            <Link href={isCustom ? "/contact" : `/booking/${tour.slug}?date=${selectedDate ? selectedDate.toISOString().split("T")[0] : ""}`} className="btn btn-primary w-full mt-5">
              {isCustom ? "Request Custom Tour" : "Book this tour"}
            </Link>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link href="/contact" className="btn btn-ghost btn-sm">Ask a question</Link>
              <SaveButton type="tour" id={tour.id} saved={isSaved} />
            </div>
            {tour.cancellationPolicy && (
              <p className="text-[0.7rem] text-muted mt-4">Policy: {tour.cancellationPolicy}</p>
            )}
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sm">
            <p className="font-semibold mb-1">⚠️ Demo tour content</p>
            <p className="text-muted text-xs">Tour details and pricing shown here are demo content that can be edited by the operator from the admin panel.</p>
          </div>
        </aside>
      </section>

      {/* related */}
      <section className="container-x pb-16">
        <SectionHeading align="center" eyebrow="Keep exploring" title="You might also like" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.filter((r) => r.id !== tour.id).slice(0, 3).map((t, i) => <Reveal key={t.id} delay={i * 0.05}><TourCard tour={t} /></Reveal>)}
        </div>
      </section>
    </div>
  );
}
