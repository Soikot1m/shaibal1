"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, Star, Clock, Users } from "lucide-react";
import { tours, destinations } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

type TourRow = typeof tours.$inferSelect;
type DestRow = typeof destinations.$inferSelect;

/** Subtle pointer-tracked tilt; disabled on touch devices and for reduced-motion users. */
function useTilt(max = 3) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-3px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return { ref, onMove, onLeave };
}

export function TourCard({ tour }: { tour: TourRow }) {
  const tilt = useTilt();
  const img = tour.images?.[0] || "";
  const discount = tour.discountPrice && tour.discountPrice > 0 && tour.discountPrice < tour.price ? tour.discountPrice : null;
  const custom = tour.price === 0;
  return (
    <Link href={`/tours/${tour.slug}`} className="group block h-full" aria-label={tour.title}>
      <article ref={tilt.ref} onMouseMove={tilt.onMove} onMouseLeave={tilt.onLeave} className="tilt-card card h-full overflow-hidden transition-[border-color,box-shadow] duration-300 group-hover:border-fg/30 group-hover:shadow-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          <img src={img} alt={tour.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="rounded-md bg-white/92 backdrop-blur px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy-900">{tour.category}</span>
            {discount && <span className="rounded-md bg-sand-500 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white">Save {Math.round(((tour.price - discount) / tour.price) * 100)}%</span>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-white/80">Departs {tour.departureCity || "Bogura"}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold"><Star className="h-3.5 w-3.5 fill-sand-400 text-sand-400" /> {(tour.rating || 0).toFixed(1)} <span className="text-white/60 font-normal">({tour.travelerCount})</span></span>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {custom ? "Flexible" : `${tour.durationDays}D / ${tour.durationNights}N`}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> up to {tour.groupSize}</span>
            <span className="ml-auto">{tour.difficulty}</span>
          </div>
          <div>
            <h3 className="text-[1.15rem] leading-snug transition-colors group-hover:text-accent">{tour.title}</h3>
            <p className="mt-1 text-sm text-muted line-clamp-2">{tour.subtitle || tour.description?.slice(0, 90)}</p>
          </div>
          <div className="mt-auto flex items-end justify-between pt-3 border-t border-line">
            {custom ? (
              <span className="font-display text-xl">Custom quote</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">from</span>
                <span className="font-display text-[1.45rem] leading-none">{formatCurrency(discount || tour.price)}</span>
                {discount && <span className="text-xs text-muted line-through">{formatCurrency(tour.price)}</span>}
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-fg">
              View <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function DestinationCard({ dest, tall = true }: { dest: DestRow; tall?: boolean }) {
  const tilt = useTilt(2.5);
  return (
    <Link href={`/destinations/${dest.slug}`} className="group block h-full" aria-label={dest.name}>
      <article ref={tilt.ref} onMouseMove={tilt.onMove} onMouseLeave={tilt.onLeave} className={`tilt-card relative overflow-hidden rounded-2xl bg-navy-900 ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
        <img src={dest.image || ""} alt={dest.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/15 to-transparent" />
        <span className="absolute top-3 left-3 rounded-md bg-white/92 backdrop-blur px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy-900">{dest.type}</span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-white/65">{dest.country}{dest.region ? ` · ${dest.region}` : ""}</p>
          <h3 className="font-display text-[1.7rem] leading-[1.05] mt-1.5">{dest.name.split(",")[0]}</h3>
          {dest.headline && <p className="mt-1 text-sm text-white/75 italic font-display">{dest.headline}</p>}
          <div className="mt-3 flex items-center justify-between text-xs text-white/85 border-t border-white/15 pt-3 translate-y-1 opacity-90 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <span>From {formatCurrency(dest.budget)}</span>
            <span className="inline-flex items-center gap-1 font-semibold">Explore <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
        </div>
      </article>
    </Link>
  );
}
