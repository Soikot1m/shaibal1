import Link from "next/link";
import { db } from "@/db";
import { tours, tourDates, destinations } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { TourForm, TourStatusButtons, AddDateForm, ExportCsv, FeatureToggle } from "@/components/admin-widgets";
import { Plus, Pencil } from "lucide-react";

export default async function AdminTours({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const sp = await searchParams;
  const [all, dates, dests] = await Promise.all([db.select().from(tours).orderBy(desc(tours.createdAt)), db.select().from(tourDates).orderBy(asc(tourDates.date)), db.select().from(destinations)]);
  const editing = sp.edit ? all.find((t) => t.id === sp.edit) : null;
  const destOpts = dests.map((d) => ({ id: d.id, name: d.name }));
  const toInit = (t: NonNullable<typeof editing>) => ({
    id: t.id, title: t.title, subtitle: t.subtitle || "", category: t.category, description: t.description || "", durationDays: t.durationDays || 0, durationNights: t.durationNights || 0,
    price: t.price, discountPrice: t.discountPrice, departureCity: t.departureCity || "", difficulty: t.difficulty || "Easy", groupSize: t.groupSize || 20, featured: !!t.featured, status: t.status,
    image: t.images?.[0] || "", gallery: (t.images || []).slice(1).join("\n"), highlights: (t.highlights || []).join("\n"), included: (t.included || []).join("\n"), excluded: (t.excluded || []).join("\n"),
    itinerary: (t.itinerary || []).map((d) => `${d.title} | ${d.activity}`).join("\n"), destinationId: t.destinationId, cancellationPolicy: t.cancellationPolicy || "",
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="chip mb-2">Catalog</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">Tours</h1></div>
        <div className="flex gap-2"><ExportCsv filename="tours" rows={all.map((t) => ({ title: t.title, slug: t.slug, category: t.category, days: t.durationDays, price: t.price, discount: t.discountPrice, status: t.status, featured: t.featured, rating: t.rating }))} /><Link href="/admin/tours?new=1" className="btn btn-primary btn-sm"><Plus className="h-4 w-4" /> New tour</Link></div>
      </div>

      {(sp.new || editing) && (
        <div className="card p-5 sm:p-6" id="form">
          <h2 className="font-display font-bold text-xl mb-4">{editing ? `Edit: ${editing.title}` : "Create a new tour"}</h2>
          <TourForm key={editing?.id || "new"} initial={editing ? toInit(editing) : undefined} destinations={destOpts} />
          <p className="text-xs text-muted mt-3"><Link href="/admin/tours" className="underline">Close form</Link> · Image uploads: connect an object-storage bucket (Supabase Storage / S3) and paste URLs here, or extend the form with an upload endpoint.</p>
        </div>
      )}

      <div className="space-y-3">
        {all.map((t) => {
          const td = dates.filter((d) => d.tourId === t.id);
          return (
            <div key={t.id} className="card p-4 grid md:grid-cols-[96px_1fr_auto] gap-4">
              <img src={t.images?.[0] || ""} alt="" className="h-20 w-full md:w-24 object-cover rounded-xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-display font-bold truncate">{t.title}</h2><StatusBadge status={t.status} />{t.featured && <span className="chip !text-xs">Featured</span>}{t.isDemo && <span className="text-[0.65rem] text-muted">demo</span>}</div>
                <p className="text-xs text-muted mt-0.5">/tours/{t.slug} · {t.category} · {t.durationDays}D{t.durationNights}N · {t.difficulty} · max {t.groupSize} · ★ {t.rating}</p>
                <p className="text-sm mt-1"><span className="font-extrabold">{formatCurrency(t.discountPrice || t.price)}</span>{t.discountPrice ? <span className="text-xs text-muted line-through ml-2">{formatCurrency(t.price)}</span> : null}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">{td.map((d) => <span key={d.id} className={`chip !text-xs ${d.date < new Date() ? "opacity-50" : ""}`}>{formatDate(d.date)} · {(d.seatsBooked || 0)}/{d.seatsTotal}</span>)}{td.length === 0 && <span className="text-xs text-muted">No departure dates yet</span>}</div>
                <div className="mt-2"><AddDateForm tourId={t.id} /></div>
              </div>
              <div className="flex md:flex-col gap-2 items-start"><Link href={`/admin/tours?edit=${t.id}#form`} className="btn btn-soft btn-sm"><Pencil className="h-4 w-4" /> Edit</Link><TourStatusButtons id={t.id} status={t.status} /><Link href={`/tours/${t.slug}`} className="text-xs text-sky-600 underline">Preview</Link></div>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="font-display font-bold mb-3">Destinations ({dests.length})</h2>
        <div className="flex flex-wrap gap-2">{dests.map((d) => <div key={d.id} className="flex items-center gap-2 border border-line rounded-full pl-3 pr-1 py-1 text-sm"><span>{d.name}</span><FeatureToggle id={d.id} featured={!!d.featured} /></div>)}</div>
        <p className="text-xs text-muted mt-3">Toggle which destinations appear in the homepage “Popular Destinations” section.</p>
      </div>
    </>
  );
}
