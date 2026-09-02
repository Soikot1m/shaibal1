"use client";
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  index,
  title,
  sub,
  align = "left",
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl mb-14", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-5", align === "center" && "justify-center")}>
          {index && <span className="eyebrow-index">{index}</span>}
          {eyebrow}
        </p>
      )}
      <h2 className="text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem]">{title}</h2>
      {sub && <p className={cn("mt-6 text-muted text-[1.05rem] leading-relaxed max-w-xl", align === "center" && "mx-auto")}>{sub}</p>}
    </div>
  );
}

export function StarRating({ value, className }: { value: number; className?: string }) {
  const v = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-4 w-4", i <= v ? "fill-sand-400 text-sand-400" : "text-line fill-line")} />
      ))}
    </span>
  );
}

const TONES: Record<string, string> = {
  pending: "bg-amber-400", confirmed: "bg-lagoon-500", paid: "bg-emerald-500", partially_paid: "bg-lagoon-400",
  cancelled: "bg-rose-500", completed: "bg-indigo-500", open: "bg-emerald-500", featured: "bg-sand-400",
  approved: "bg-emerald-500", published: "bg-emerald-500", draft: "bg-gray-400", "in-progress": "bg-lagoon-500",
  planning: "bg-gray-400", new: "bg-amber-400", quoted: "bg-lagoon-500", closed: "bg-gray-400", resolved: "bg-emerald-500",
  partial: "bg-lagoon-400", low: "bg-gray-400", normal: "bg-lagoon-400", high: "bg-amber-400", urgent: "bg-rose-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-fg">
      <span className={cn("h-1.5 w-1.5 rounded-full", TONES[status] ?? "bg-gray-400")} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full bg-fg text-paper font-display shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function PriceTag({ price, discount, suffix = "/ person" }: { price: number; discount?: number | null; suffix?: string }) {
  const final = discount && discount > 0 && discount < price ? discount : price;
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">From</span>
      <span className="font-display text-[1.6rem] leading-none">{formatCurrency(final)}</span>
      {discount && discount < price ? <span className="text-xs text-muted line-through">{formatCurrency(price)}</span> : null}
      <span className="text-xs text-muted">{suffix}</span>
    </div>
  );
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString("en-IN")}`;
}
