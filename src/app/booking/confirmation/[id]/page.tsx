import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPaymentsByBooking } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { BookingQR, PayPanel, PrintButton, ShareButton, TripProgress } from "@/components/booking-widgets";
import { CheckCircle2, CalendarDays, Users, Phone, Mail } from "lucide-react";

export const metadata = { title: "Booking confirmation" };

export default async function ConfirmationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ method?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  const b = rows[0];
  if (!b) notFound();
  const pays = await getPaymentsByBooking(b.id);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const verifyUrl = `${base}/verify/${b.bookingCode}`;
  const travelers = b.travelers || [];

  return (
    <div className="container-x pt-24 pb-16 max-w-5xl">
      <div className="flex items-start gap-4 mb-8">
        <span className="grid place-items-center h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 shrink-0"><CheckCircle2 className="h-8 w-8" /></span>
        <div>
          <p className="chip mb-2">Booking {b.status === "pending" ? "request received" : b.status.replace("_", " ")}</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">You&apos;re almost on your way!</h1>
          <p className="text-muted mt-1">Booking ID <span className="font-mono font-bold text-fg">{b.bookingCode}</span>. We&apos;ve saved your details — complete payment to secure seats.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <section className="card p-6 print:shadow-none" id="invoice">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="font-display font-bold text-xl">Booking summary</h2>
              <StatusBadge status={b.status} />
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><dt className="text-muted">Tour</dt><dd className="font-semibold">{b.tourTitle}</dd></div>
              <div><dt className="text-muted flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Travel date</dt><dd className="font-semibold">{formatDate(b.date)}</dd></div>
              <div><dt className="text-muted">Lead traveler</dt><dd className="font-semibold">{b.contactName}</dd></div>
              <div><dt className="text-muted flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Travelers</dt><dd className="font-semibold">{travelers.length ? travelers.map((t) => t.name).join(", ") : "1"}</dd></div>
              <div><dt className="text-muted flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</dt><dd className="font-semibold">{b.contactPhone}</dd></div>
              <div><dt className="text-muted flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</dt><dd className="font-semibold">{b.contactEmail}</dd></div>
              {b.specialRequests && <div className="sm:col-span-2"><dt className="text-muted">Preferences & requests</dt><dd className="font-semibold">{b.specialRequests}</dd></div>}
            </dl>
            <div className="divider my-5" />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5"><p className="text-xs text-muted">Total</p><p className="font-extrabold">{formatCurrency(b.total)}</p></div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10"><p className="text-xs text-muted">Paid</p><p className="font-extrabold text-emerald-600">{formatCurrency(b.paidAmount)}</p></div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10"><p className="text-xs text-muted">Remaining</p><p className="font-extrabold text-amber-600">{formatCurrency((b.total || 0) - (b.paidAmount || 0))}</p></div>
            </div>
            {pays.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold text-sm mb-2">Payment history</h3>
                <table className="table-base"><thead><tr><th>Date</th><th>Gateway</th><th>Transaction</th><th className="text-right">Amount</th></tr></thead>
                  <tbody>{pays.map((p) => <tr key={p.id}><td>{formatDate(p.createdAt)}</td><td>{p.gateway}</td><td className="font-mono text-xs">{p.transactionId}</td><td className="text-right font-semibold">{formatCurrency(p.amount)}</td></tr>)}</tbody></table>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-5 print:hidden">
              <PrintButton />
              <ShareButton url={verifyUrl} title={`Booking ${b.bookingCode}`} />
              <Link href="/account" className="btn btn-soft btn-sm">Go to my dashboard</Link>
            </div>
          </section>

          {(b.progressJson || []).length > 0 && (
            <section className="card p-6 print:hidden">
              <TripProgress steps={b.progressJson || []} progress={b.progress || 0} />
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-6 text-center">
            <p className="text-sm font-semibold mb-3">Your booking QR</p>
            <BookingQR value={verifyUrl} />
            <p className="text-xs text-muted mt-3">Scan to verify at departure · <Link href={`/verify/${b.bookingCode}`} className="underline">verification page</Link></p>
          </div>
          <div className="card p-6 print:hidden">
            <h3 className="font-display font-bold mb-3">Complete payment</h3>
            <PayPanel bookingId={b.id} total={b.total || 0} paid={b.paidAmount || 0} defaultMethod={sp.method} />
          </div>
        </aside>
      </div>
    </div>
  );
}
