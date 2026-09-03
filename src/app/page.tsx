import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, Headset, Handshake, Route, Users, Sparkles, MapPin, Quote, Calendar, Clock, Star } from "lucide-react";
import { Hero } from "@/components/hero";
import { TourCard, DestinationCard } from "@/components/cards";
import { SectionHeading, StarRating, StatusBadge } from "@/components/ui";
import { Reveal, SectionShell } from "@/components/motion";
import { FaqAccordion } from "@/components/faq-accordion";
import { JourneyScroll } from "@/components/journey-scroll";
import { EmptyState } from "@/components/empty-state";
import { getFeaturedTours, getDestinations, getFeaturedReviews, getGallery, getBlogPosts, getFaqs, getPublishedTours, getUpcomingDepartures } from "@/lib/data";
import { getSiteSettings } from "@/lib/content";
import { IMG } from "@/lib/images";
import { formatDate, formatCurrency } from "@/lib/utils";

const WHY = [
  { icon: ShieldCheck, t: "Transparent pricing", d: "Every quote lists what's included. No surprises at checkout." },
  { icon: Headset, t: "Dedicated coordinator", d: "One person who knows your trip inside out." },
  { icon: Handshake, t: "Flexible itineraries", d: "Ready departures or fully private custom trips." },
  { icon: Route, t: "Vetted logistics", d: "Trusted transport, handpicked stays, sensible timings." },
  { icon: Users, t: "Group expertise", d: "Seat plans, rooms, and care for families and teams." },
  { icon: Sparkles, t: "Live trip tracking", d: "Follow progress and updates from your phone." },
];

const STEPS = [
  { n: "01", t: "Discover", d: "Browse destinations and departures that match your style." },
  { n: "02", t: "Choose a date", d: "Every departure shows live seat availability." },
  { n: "03", t: "Book & confirm", d: "Add travelers, pay deposit, receive booking ID and QR." },
  { n: "04", t: "Travel & track", d: "Follow progress live. Leave a review when home." },
];

export default async function HomePage() {
  const [tours, featuredDests, reviews, gallery, blog, faqs, allTours, settings] = await Promise.all([
    getFeaturedTours(), getDestinations({ featured: true }), getFeaturedReviews(), getGallery(), getBlogPosts(3), getFaqs(), getPublishedTours(), getSiteSettings(),
  ]);
  const departures = await getUpcomingDepartures(8);
  const [lead, ...rest] = reviews;
  const heroTitle = settings.heroTitle !== "Explore More. Travel Better. Create Memories." ? settings.heroTitle : undefined;

  return (
    <>
      <Hero title={heroTitle} subtitle={settings.heroSubtitle} />

      {/* Why Shaibal */}
      <SectionShell id="why">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-14 lg:gap-20">
          <div>
            <p className="eyebrow mb-5"><span className="eyebrow-index">01</span> Why Shaibal</p>
            <h2 className="text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem]">Agency care, with the clarity of <em>good software.</em></h2>
            <p className="mt-6 text-muted text-[1.05rem] leading-relaxed max-w-md">We plan the route, the stays and the timings, then keep you informed the whole way — so the only thing you carry is the memory.</p>
            <Link href="/about" className="inline-flex items-center gap-1.5 mt-8 text-sm font-semibold border-b border-fg pb-0.5 hover:text-accent hover:border-accent transition-colors">Our story <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {WHY.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.04}>
                <div className="h-full">
                  <w.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  <h3 className="mt-4 text-[1.05rem] font-display">{w.t}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{w.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* Featured tours */}
      <SectionShell id="tours" className="bg-panel/70 border-y border-line">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading className="!mb-0" index="02" eyebrow="Featured journeys" title={<>Departures our travelers <em>keep recommending.</em></>} />
          <Link href="/tours" className="btn btn-ghost">All tours <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.filter((t) => t.price > 0).slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.06}><TourCard tour={t} /></Reveal>
          ))}
        </div>
      </SectionShell>

      <JourneyScroll />

      {/* Upcoming departures */}
      <SectionShell id="trips" className="bg-panel/70 border-y border-line">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <SectionHeading className="!mb-0" index="04" eyebrow="Upcoming departures" title={<>Booking is <em>open.</em></>} sub="Real dates with live seat counts. Deposits secure your place." />
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live availability</span>
        </div>
        {departures.length === 0 ? (
          <EmptyState kind="departures" tone="card" title="No departures are open for booking yet." description="New dates are added regularly. Tell us where you want to go and we'll prioritise it." actionLabel="Ask about dates" actionHref="/contact" />
        ) : (
          <div className="card overflow-hidden divide-y divide-line">
            {departures.map(({ date: td, tour }) => {
              const total = td.seatsTotal || 0;
              const left = total - (td.seatsBooked || 0);
              const pct = Math.min(100, Math.round(((td.seatsBooked || 0) / Math.max(1, total)) * 100));
              const d = td.date;
              return (
                <Link key={td.id} href={`/booking/${tour!.slug}?date=${d.toISOString().split("T")[0]}`} className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1.5fr_1fr_auto_auto] items-center gap-4 sm:gap-6 p-4 sm:px-6 hover:bg-paper transition-colors group">
                  <div className="text-center border-r border-line pr-4">
                    <p className="font-display text-[2rem] leading-none">{d.getDate()}</p>
                    <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted mt-1">{d.toLocaleDateString("en-GB", { month: "short" })}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-accent transition-colors">{tour!.title}</p>
                    <p className="text-xs text-muted mt-0.5 inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Departs {tour!.departureCity} · {tour!.durationDays}D/{tour!.durationNights}N · {tour!.difficulty}</p>
                  </div>
                  <div className="col-start-2 sm:col-start-auto">
                    <div className="flex justify-between text-[0.66rem] uppercase tracking-[0.1em] text-muted mb-1.5"><span>{left > 0 ? `${left} seats left` : "Waitlist"}</span><span>{td.seatsBooked}/{total}</span></div>
                    <div className="h-1.5 rounded-full bg-line overflow-hidden"><div className={`h-full rounded-full ${pct > 70 ? "bg-sand-400" : "bg-accent"}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                  <p className="font-display text-xl text-right col-start-2 sm:col-start-auto">{formatCurrency(td.price || tour!.discountPrice || tour!.price)}</p>
                  <span className="btn btn-primary btn-sm hidden sm:inline-flex">Book</span>
                </Link>
              );
            })}
          </div>
        )}
      </SectionShell>

      {/* Destinations */}
      <SectionShell id="destinations">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading className="!mb-0" index="05" eyebrow="Destinations" title={<>Hills, coast, forest, <em>and beyond.</em></>} />
          <Link href="/destinations" className="btn btn-ghost">All destinations <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDests.slice(0, 8).map((d, i) => (
            <Reveal key={d.id} delay={(i % 4) * 0.05} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <DestinationCard dest={d} tall={i !== 0} />
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* How it works */}
      <SectionShell id="how" className="bg-panel/70 border-y border-line">
        <SectionHeading index="06" eyebrow="How booking works" title={<>From idea to departure in <em>four steps.</em></>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="border-t-2 border-fg pt-6 pb-4 h-full">
                <p className="font-display text-[2.8rem] text-accent">{s.n}</p>
                <h3 className="mt-5 text-lg font-display">{s.t}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* Planner band */}
      <SectionShell>
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 text-white min-h-[460px] flex items-end">
          <img src={IMG.hero2} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/55 to-transparent" />
          <div className="relative p-10 sm:p-16 max-w-2xl">
            <p className="eyebrow !text-sand-200 mb-5">Travel planner</p>
            <h2 className="text-[2.2rem] sm:text-[3rem] text-white">Sketch the trip you've been <em className="!text-sand-200">picturing.</em></h2>
            <p className="mt-6 text-white/75 text-[1.05rem] max-w-lg">Set dates, people and budget. We draft a day-by-day plan from our real itineraries — complete with a live budget, packing list and a shareable link.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/planner" className="btn btn-white btn-lg">Open the planner</Link>
              <Link href="/contact#custom" className="btn btn-glass btn-lg">Request a custom tour</Link>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* Stories */}
      {lead && (
        <SectionShell id="reviews" className="bg-panel/70 border-y border-line">
          <SectionHeading index="07" eyebrow="Traveler stories" title={<>Told by the people <em>who went.</em></>} />
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
            <figure className="card p-10 sm:p-12 flex flex-col">
              <Quote className="h-10 w-10 text-sand-400" strokeWidth={1.5} />
              <blockquote className="mt-8 font-display text-[1.5rem] sm:text-[1.9rem] leading-[1.3]">"{lead.content}"</blockquote>
              <figcaption className="mt-10 flex items-center justify-between gap-4 pt-7 border-t border-line">
                <div><p className="font-semibold">{lead.author}</p><p className="text-xs text-muted mt-0.5">{lead.title} · traveled {lead.travelDate}</p></div>
                <StarRating value={lead.rating} />
              </figcaption>
            </figure>
            <div className="grid gap-4">
              {rest.slice(0, 3).map((r) => (
                <figure key={r.id} className="card p-6">
                  <div className="flex items-center justify-between"><StarRating value={r.rating} /><span className="text-[0.64rem] uppercase tracking-[0.12em] text-muted">{r.travelDate}</span></div>
                  <blockquote className="mt-4 text-sm text-muted leading-relaxed line-clamp-3">"{r.content}"</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </SectionShell>
      )}

      {/* Gallery strip */}
      <SectionShell id="gallery">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <SectionHeading className="!mb-0" index="08" eyebrow="Gallery" title={<>Moments from <em>the road.</em></>} />
          <Link href="/gallery" className="btn btn-ghost">Open gallery <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {gallery.slice(0, 8).map((g, i) => (
            <Link key={g.id} href="/gallery" className={`group relative overflow-hidden rounded-xl bg-line ${i === 0 || i === 5 ? "md:col-span-2" : ""}`}>
              <img src={g.image} alt={g.title || ""} loading="lazy" className="h-[180px] md:h-[230px] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]" />
              <span className="absolute bottom-3 left-3 text-[0.64rem] uppercase tracking-[0.14em] text-white opacity-0 group-hover:opacity-100 transition">{g.destination}</span>
            </Link>
          ))}
        </div>
      </SectionShell>

      {/* Guides */}
      <SectionShell id="blog" className="bg-panel/70 border-y border-line">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHeading className="!mb-0" index="09" eyebrow="Travel guides" title={<>Plan smarter with <em>field notes.</em></>} />
          <Link href="/blog" className="btn btn-ghost">All guides <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {blog.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.05}>
              <Link href={`/blog/${b.slug}`} className="group block">
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-line"><img src={b.cover || ""} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]" /></div>
                <p className="mt-5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-accent">{b.category}</p>
                <h3 className="mt-2.5 text-lg leading-snug group-hover:text-accent transition-colors">{b.title}</h3>
                <p className="mt-2.5 text-sm text-muted line-clamp-2">{b.excerpt}</p>
                <p className="mt-4 text-xs text-muted">{b.readingTime} · {formatDate(b.createdAt)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      {/* FAQ */}
      <SectionShell id="faq">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <div>
            <SectionHeading className="!mb-6" index="10" eyebrow="Good to know" title={<>Questions, <em>answered.</em></>} sub="Booking, payments, cancellations and what to pack — the essentials before you go." />
            <Link href="/contact#support" className="btn btn-ghost">Ask something else <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <FaqAccordion items={faqs.slice(0, 6).map((f) => ({ question: f.question, answer: f.answer }))} />
        </div>
      </SectionShell>

      {/* Final CTA */}
      <SectionShell className="!pt-0">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 text-white text-center">
          <img src={IMG.hero3} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" loading="lazy" />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative px-6 py-24 sm:py-32 max-w-2xl mx-auto">
            <p className="eyebrow !text-sand-200 justify-center mb-6">Ready when you are</p>
            <h2 className="text-[2.6rem] sm:text-[3.8rem] text-white">Your next adventure <em className="!text-sand-200">is waiting.</em></h2>
            <p className="mt-7 text-white/80 text-lg">From the hills of Bandarban to the shores of Cox's Bazar, let Shaibal Tours & Travels turn a journey into a memory.</p>
            <div className="mt-11 flex flex-wrap justify-center gap-3">
              <Link href="/tours" className="btn btn-white btn-lg">Explore tours <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/planner" className="btn btn-glass btn-lg">Plan my trip</Link>
              <Link href="/contact" className="btn btn-glass btn-lg">Talk to us</Link>
            </div>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
