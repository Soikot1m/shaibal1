import Link from "next/link";
import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { StatusSelect, RecordPaymentForm, ProgressEditor, ExportCsv } from "@/components/admin-widgets";

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; open?: string }> }) {
  const sp = await searchParams;
  const [all, pays] = await Promise.all([db.select().from(bookings).orderBy(desc(bookings.createdAt)), db.select().from(payments).orderBy(desc(payments.createdAt))]);
  const q = (sp.q || "").toLowerCase();
  const list = all.filter((b) => (!sp.status || sp.status === "all" || b.status === sp.status) && (!q || [b.bookingCode, b.tourTitle, b.contactName, b.contactPhone, b.contactEmail].join(" ").toLowerCase().includes(q)));
  const statuses = ["all", "pending", "confirmed", "partially_paid", "paid", "completed", "cancelled"];
  const counts = Object.fromEntries(statuses.map((s) => [s, s === "all" ? all.length : all.filter((b) => b.status === s).length]));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="chip mb-2">Operations</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">Bookings</h1></div>
        <div className="flex gap-2">
          <ExportCsv filename="bookings" rows={list.map((b) => ({ code: b.bookingCode, tour: b.tourTitle, customer: b.contactName, phone: b.contactPhone, email: b.contactEmail, date: b.date?.toISOString().split("T")[0], travelers: (b.travelers || []).length || 1, total: b.total, paid: b.paidAmount, status: b.status, progress: b.progress }))} />
          <ExportCsv filename="payments" label="Export payments" rows={pays.map((p) => ({ date: p.createdAt?.toISOString(), booking: all.find((b) => b.id === p.bookingId)?.bookingCode, gateway: p.gateway, transaction: p.transactionId, amount: p.amount, status: p.status, paidBy: p.paidBy }))} />
        </div>
      </div>

      <div className="card p-3 flex flex-wrap items-center gap-2">
        <form className="flex gap-2 flex-1 min-w-[220px]"><input name="q" defaultValue={sp.q} placeholder="Search code, name, phone, tour…" className="input !py-2" />{sp.status && <input type="hidden" name="status" value={sp.status} />}<button className="btn btn-primary btn-sm">Search</button></form>
        <div className="flex flex-wrap gap-1.5">{statuses.map((s) => <Link key={s} href={`/admin/bookings?status=${s}${sp.q ? `&q=${sp.q}` : ""}`} className={`chip ${(sp.status || "all") === s ? "chip-active" : ""}`}>{s.replace("_", " ")} <span className="opacity-70">{counts[s]}</span></Link>)}</div>
      </div>

      {list.length === 0 ? <div className="card p-12 text-center text-muted">No bookings match.</div> : (
        <div className="space-y-3">
          {list.map((b) => {
            const bp = pays.filter((p) => p.bookingId === b.id);
            const remaining = Math.max(0, (b.total || 0) - (b.paidAmount || 0));
            const open = sp.open === b.id;
            return (
              <div key={b.id} className="card p-4 sm:p-5">
                <div className="grid lg:grid-cols-[1fr_auto] gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{b.bookingCode}</span><h2 className="font-display font-bold truncate">{b.tourTitle}</h2><StatusBadge status={b.status} /><span className="text-xs text-muted">{b.createdBy === "admin" ? "manual" : "online"}</span></div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted">
                      <span>👤 {b.contactName}</span><span>📞 {b.contactPhone}</span><span>✉️ {b.contactEmail}</span><span>📅 {formatDate(b.date)}</span><span>👥 {(b.travelers || []).length || 1}</span>
                      {b.emergencyName && <span>🆘 {b.emergencyName} ({b.emergencyPhone})</span>}
                    </div>
                    {b.specialRequests && <p className="text-xs mt-2 p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10">{b.specialRequests}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="text-sm"><span className="font-extrabold">{formatCurrency(b.total)}</span> <span className="text-muted">· paid {formatCurrency(b.paidAmount)} · due <span className={remaining > 0 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>{formatCurrency(remaining)}</span></span></div>
                      <div className="h-1.5 w-32 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, Math.round(((b.paidAmount || 0) / Math.max(1, b.total || 1)) * 100))}%` }} /></div>
                      <span className="text-xs text-muted">Trip {b.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-start lg:items-end">
                    <StatusSelect id={b.id} value={b.status} />
                    <RecordPaymentForm bookingId={b.id} remaining={remaining} />
                    <div className="flex gap-2 text-xs"><Link href={`/admin/bookings?${new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}), open: open ? "" : b.id }).toString()}`} className="btn btn-soft btn-sm">{open ? "Hide" : "Trip progress & payments"}</Link><Link href={`/booking/confirmation/${b.id}`} className="btn btn-ghost btn-sm">Invoice</Link></div>
                  </div>
                </div>
                {open && (
                  <div className="grid md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-line">
                    <div><h3 className="font-semibold text-sm mb-2">Trip progress tracker <span className="text-xs text-muted font-normal">(click icons to cycle ✓ / ○ / ! / ×)</span></h3><ProgressEditor bookingId={b.id} steps={b.progressJson || []} /></div>
                    <div><h3 className="font-semibold text-sm mb-2">Payment history</h3>{bp.length ? <table className="table-base"><thead><tr><th>Date</th><th>Gateway</th><th>Ref</th><th className="text-right">Amount</th></tr></thead><tbody>{bp.map((p) => <tr key={p.id}><td>{formatDate(p.createdAt)}</td><td>{p.gateway}</td><td className="font-mono text-xs">{p.transactionId}</td><td className="text-right font-semibold">{formatCurrency(p.amount)}</td></tr>)}</tbody></table> : <p className="text-sm text-muted">No payments yet.</p>}
                      <h3 className="font-semibold text-sm mt-4 mb-1">Travelers</h3><ul className="text-sm text-muted">{(b.travelers || []).map((t, i) => <li key={i}>• {t.name}{t.age ? `, ${t.age}` : ""}{t.gender ? ` · ${t.gender}` : ""}</li>)}</ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
