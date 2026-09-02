import Link from "next/link";
import { db } from "@/db";
import { trips, participants, tripExpenses, payments, bookings, tours } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { BreakdownPie } from "@/components/admin-charts";
import { ExpenseForm, DeleteExpenseButton, ParticipantForm, TripForm, ExportCsv } from "@/components/admin-widgets";
import { TrendingUp, TrendingDown, Users, Route as RouteIcon } from "lucide-react";

export default async function AdminFinance({ searchParams }: { searchParams: Promise<{ trip?: string }> }) {
  const sp = await searchParams;
  const [allTrips, allParts, allExp, allPays, allBookings, allTours] = await Promise.all([
    db.select().from(trips).orderBy(desc(trips.createdAt)), db.select().from(participants), db.select().from(tripExpenses).orderBy(desc(tripExpenses.date)),
    db.select().from(payments), db.select().from(bookings), db.select().from(tours),
  ]);
  const trip = allTrips.find((t) => t.id === sp.trip) || allTrips[0];
  const parts = trip ? allParts.filter((p) => p.tripId === trip.id) : [];
  const exps = trip ? allExp.filter((e) => e.tripId === trip.id) : [];
  const linkedBookings = trip?.tourId ? allBookings.filter((b) => b.tourId === trip.tourId && b.status !== "cancelled") : [];
  const customerPayments = linkedBookings.reduce((a, b) => a + (b.paidAmount || 0), 0);
  const revenue = Math.max(trip?.revenue || 0, customerPayments);
  const totalExp = exps.reduce((a, e) => a + e.amount, 0);
  const profit = revenue - totalExp;
  const n = Math.max(1, parts.length || linkedBookings.reduce((a, b) => a + ((b.travelers || []).length || 1), 0));
  const cat = (c: string) => exps.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0);
  const byCat = Object.entries(exps.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const allTimeRevenue = allPays.filter((p) => p.status === "confirmed").reduce((a, p) => a + p.amount, 0);
  const allTimeExp = allExp.reduce((a, e) => a + e.amount, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="chip mb-2">Accounting</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">Trips, Groups &amp; Finance</h1></div>
        <div className="flex gap-2"><ExportCsv filename="expenses" rows={allExp.map((e) => ({ trip: allTrips.find((t) => t.id === e.tripId)?.name, date: e.date?.toISOString().split("T")[0], category: e.category, title: e.title, amount: e.amount, paidBy: e.paidBy, method: e.method, notes: e.description }))} /><ExportCsv filename="profit-report" label="Profit report" rows={allTrips.map((t) => { const ex = allExp.filter((e) => e.tripId === t.id).reduce((a, e) => a + e.amount, 0); return { trip: t.name, start: t.startDate?.toISOString().split("T")[0], revenue: t.revenue, expenses: ex, profit: (t.revenue || 0) - ex, participants: allParts.filter((p) => p.tripId === t.id).length }; })} /></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4"><p className="text-xs text-muted">All-time revenue</p><p className="font-display font-extrabold text-xl">{formatCurrency(allTimeRevenue)}</p></div>
        <div className="card p-4"><p className="text-xs text-muted">All-time expenses</p><p className="font-display font-extrabold text-xl">{formatCurrency(allTimeExp)}</p></div>
        <div className="card p-4"><p className="text-xs text-muted">Net</p><p className={`font-display font-extrabold text-xl ${allTimeRevenue - allTimeExp >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(allTimeRevenue - allTimeExp)}</p></div>
        <div className="card p-4"><p className="text-xs text-muted">Trip groups</p><p className="font-display font-extrabold text-xl">{allTrips.length}</p></div>
      </div>

      <div className="card p-5"><h2 className="font-display font-bold mb-3">Create trip group</h2><TripForm tours={allTours.map((t) => ({ id: t.id, title: t.title }))} /></div>

      <div className="flex flex-wrap gap-2">{allTrips.map((t) => <Link key={t.id} href={`/admin/finance?trip=${t.id}`} className={`chip ${trip?.id === t.id ? "chip-active" : ""}`}>{t.name}</Link>)}</div>

      {trip ? (
        <>
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2"><h2 className="font-display font-bold text-xl">{trip.name}</h2><StatusBadge status={trip.status || "planning"} /><span className="text-xs text-muted">{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span></div>
            <p className="text-sm flex items-center gap-2 flex-wrap"><RouteIcon className="h-4 w-4 text-sky-500" />{(trip.route || []).map((r, i) => <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-muted">→</span>}<span className="font-medium">{r}</span></span>)}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-3">
              <div className="card p-5"><TrendingUp className="h-5 w-5 text-emerald-500 mb-2" /><p className="text-xs text-muted">Revenue</p><p className="font-display font-extrabold text-2xl">{formatCurrency(revenue)}</p><p className="text-[0.7rem] text-muted">customer payments {formatCurrency(customerPayments)}</p></div>
              <div className="card p-5"><TrendingDown className="h-5 w-5 text-rose-500 mb-2" /><p className="text-xs text-muted">Expenses</p><p className="font-display font-extrabold text-2xl">{formatCurrency(totalExp)}</p><p className="text-[0.7rem] text-muted">{exps.length} entries</p></div>
              <div className={`card p-5 ${profit >= 0 ? "border-emerald-200 dark:border-emerald-500/30" : "border-rose-200"}`}><Users className="h-5 w-5 text-sky-500 mb-2" /><p className="text-xs text-muted">{profit >= 0 ? "Profit" : "Loss"}</p><p className={`font-display font-extrabold text-2xl ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(Math.abs(profit))}</p><p className="text-[0.7rem] text-muted">margin {revenue ? Math.round((profit / revenue) * 100) : 0}%</p></div>
              <div className="card p-4 sm:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-sm">
                {[["Per traveler cost", totalExp / n], ["Hotel / person", cat("Hotel") / n], ["Transport / person", cat("Transport") / n], ["Food / person", cat("Food") / n], ["Revenue / person", revenue / n]].map(([l, v]) => <div key={l as string}><p className="text-xs text-muted">{l as string}</p><p className="font-bold">{formatCurrency(Math.round(v as number))}</p></div>)}
              </div>
            </div>
            <div className="card p-5"><h3 className="font-semibold text-sm mb-1">Expense breakdown</h3>{byCat.length ? <BreakdownPie data={byCat} height={230} /> : <p className="text-sm text-muted">No expenses yet.</p>}</div>
          </div>

          <div className="card p-5"><h2 className="font-display font-bold mb-3">Record expense</h2><ExpenseForm trips={allTrips.map((t) => ({ id: t.id, name: t.name }))} defaultTrip={trip.id} /></div>

          <div className="card p-5 overflow-x-auto">
            <h2 className="font-display font-bold mb-3">Expenses · {trip.name}</h2>
            {exps.length ? <table className="table-base"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Paid by</th><th>Method</th><th className="text-right">Amount</th><th></th></tr></thead><tbody>{exps.map((e) => <tr key={e.id}><td>{formatDate(e.date)}</td><td><span className="chip !text-xs">{e.category}</span></td><td><p className="font-medium">{e.title}</p>{e.description && <p className="text-xs text-muted">{e.description}</p>}</td><td>{e.paidBy}</td><td>{e.method}</td><td className="text-right font-semibold">{formatCurrency(e.amount)}</td><td><DeleteExpenseButton id={e.id} /></td></tr>)}</tbody><tfoot><tr><td colSpan={5} className="font-bold text-right">Total</td><td className="text-right font-extrabold">{formatCurrency(totalExp)}</td><td /></tr></tfoot></table> : <p className="text-sm text-muted">No expenses recorded for this trip.</p>}
          </div>

          <div className="card p-5 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 className="font-display font-bold">Participants ({parts.length})</h2><ExportCsv filename={`participants-${trip.name}`} rows={parts.map((p) => ({ name: p.name, phone: p.phone, email: p.email, age: p.age, gender: p.gender, seat: p.seat, room: p.room, emergency: p.emergencyName, emergencyPhone: p.emergencyPhone, payment: p.paymentStatus, notes: p.special }))} /></div>
            <ParticipantForm tripId={trip.id} />
            {parts.length > 0 && <table className="table-base mt-4"><thead><tr><th>Name</th><th>Phone</th><th>Age / Gender</th><th>Seat</th><th>Room</th><th>Emergency</th><th>Payment</th></tr></thead><tbody>{parts.map((p) => <tr key={p.id}><td className="font-medium">{p.name}</td><td>{p.phone}</td><td>{p.age || "—"} / {p.gender || "—"}</td><td>{p.seat || "—"}</td><td>{p.room || "—"}</td><td className="text-xs">{p.emergencyName ? `${p.emergencyName} (${p.emergencyPhone})` : "—"}</td><td><StatusBadge status={p.paymentStatus || "pending"} /></td></tr>)}</tbody></table>}
          </div>
        </>
      ) : <div className="card p-10 text-center text-muted">Create a trip group to start tracking participants and expenses.</div>}
    </>
  );
}
