import Image from "next/image";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { ShieldCheck, ShieldX } from "lucide-react";

export const metadata = { title: "Verify booking" };

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const rows = await db.select().from(bookings).where(eq(bookings.bookingCode, code.toUpperCase())).limit(1);
  const b = rows[0];
  const valid = b && b.status !== "cancelled";
  const firstName = b?.contactName?.split(" ")[0];

  return (
    <div className="min-h-[80svh] grid place-items-center pt-24 pb-16 px-4">
      <div className="card p-8 max-w-md w-full text-center shadow-float">
        <Image src="/logo.png" alt="Shaibal Tours" width={56} height={56} className="mx-auto rounded-[26%]" />
        <div className={`mx-auto mt-5 grid place-items-center h-16 w-16 rounded-full ${valid ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15" : "bg-rose-100 text-rose-600 dark:bg-rose-500/15"}`}>
          {valid ? <ShieldCheck className="h-8 w-8" /> : <ShieldX className="h-8 w-8" />}
        </div>
        <h1 className="font-display font-extrabold text-2xl mt-4">{b ? (valid ? "Booking verified" : "Booking not valid") : "Booking not found"}</h1>
        <p className="font-mono text-sm text-muted mt-1">{code.toUpperCase()}</p>
        {b && (
          <dl className="mt-6 text-left space-y-2 text-sm bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
            <div className="flex justify-between"><dt className="text-muted">Tour</dt><dd className="font-semibold text-right">{b.tourTitle}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Travel date</dt><dd className="font-semibold">{formatDate(b.date)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Lead traveler</dt><dd className="font-semibold">{firstName} ·····</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Travelers</dt><dd className="font-semibold">{(b.travelers || []).length || 1}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-muted">Status</dt><dd><StatusBadge status={b.status} /></dd></div>
          </dl>
        )}
        <p className="text-[0.7rem] text-muted mt-5">Personal details are masked to protect traveler privacy. Verified by Shaibal Tours &amp; Travels.</p>
      </div>
    </div>
  );
}
