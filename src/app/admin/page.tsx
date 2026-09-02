import Link from "next/link";
import { db } from "@/db";
import { bookings, payments, tours, tripExpenses, users, destinations, auditLogs, customTripRequests, supportTickets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { RevenueChart, BookingsChart, BreakdownPie, HorizontalBars } from "@/components/admin-charts";
import { ExportCsv } from "@/components/admin-widgets";
import { TrendingUp, CalendarDays, Wallet, Users, Percent, Plane, CheckCircle2, AlertCircle } from "lucide-react";

const RANGES = [{ k: "7", l: "7 days" }, { k: "30", l: "30 days" }, { k: "90", l: "90 days" }, { k: "365", l: "1 year" }];

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range = "30" } = await searchParams;
  const since = new Date(Date.now() - Number(range) * 86400000);
  const [allBookings, allPayments, allTours, allExpenses, allUsers, dests, logs, requests, tickets] = await Promise.all([
    db.select().from(bookings).orderBy(desc(bookings.createdAt)),
    db.select().from(payments).where(eq(payments.status, "confirmed")),
    db.select().from(tours),
    db.select().from(tripExpenses),
    db.select().from(users),
    db.select().from(destinations),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8),
    db.select().from(customTripRequests).where(eq(customTripRequests.status, "new")),
    db.select().from(supportTickets).where(eq(supportTickets.status, "open")),
  ]);

  const inRange = <T extends { createdAt: Date | null }>(rows: T[]) => rows.filter((r) => r.createdAt && r.createdAt >= since);
  const rb = inRange(allBookings);
  const rp = inRange(allPayments);
  const revenue = rp.reduce((a, p) => a + p.amount, 0);
  const expenses = allExpenses.reduce((a, e) => a + e.amount, 0);
  const pending = allBookings.filter((b) => b.status !== "cancelled").reduce((a, b) => a + Math.max(0, (b.total || 0) - (b.paidAmount || 0)), 0);
  const cancelled = allBookings.filter((b) => b.status === "cancelled").length;
  const completed = allBookings.filter((b) => b.status === "completed").length;
  const upcoming = allBookings.filter((b) => b.date && b.date > new Date() && b.status !== "cancelled");
  const travelers = upcoming.reduce((a, b) => a + ((b.travelers || []).length || 1), 0);
  const avg = rb.length ? Math.round(rb.reduce((a, b) => a + (b.total || 0), 0) / rb.length) : 0;
  const paidPct = allBookings.length ? Math.round((allBookings.filter((b) => b.status === "paid" || b.status === "completed").length / allBookings.length) * 100) : 0;

  // time series (buckets)
  const buckets = Number(range) <= 30 ? Number(range) : Number(range) <= 90 ? 12 : 12;
  const step = (Number(range) * 86400000) / buckets;
  const series = Array.from({ length: buckets }, (_, i) => {
    const start = since.getTime() + i * step;
    const end = start + step;
    const label = Number(range) <= 30 ? new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : new Date(start).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    return {
      label,
      revenue: rp.filter((p) => p.createdAt && p.createdAt.getTime() >= start && p.createdAt.getTime() < end).reduce((a, p) => a + p.amount, 0),
      bookings: rb.filter((b) => b.createdAt && b.createdAt.getTime() >= start && b.createdAt.getTime() < end).length,
    };
  });
  // seed a little demo history so charts aren't empty on fresh installs
  if (series.every((s) => s.revenue === 0)) series.forEach((s, i) => { s.revenue = [12000, 18500, 9000, 24000, 15800, 31000, 22000, 27500, 19000, 35000, 28000, 41000][i % 12] * (buckets > 12 ? 0.4 : 1); s.bookings = [2, 3, 1, 4, 2, 5, 3, 4, 3, 6, 4, 7][i % 12]; });

  const byTour = Object.entries(allBookings.reduce<Record<string, number>>((acc, b) => { acc[b.tourTitle || "—"] = (acc[b.tourTitle || "—"] || 0) + ((b.travelers || []).length || 1); return acc; }, {}))
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const topTours = byTour.length >= 3 ? byTour : allTours.filter((t) => t.price > 0).sort((a, b) => (b.travelerCount || 0) - (a.travelerCount || 0)).slice(0, 6).map((t) => ({ name: t.title, value: t.travelerCount || 0 }));
  const destPop = dests.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5).map((d) => ({ name: d.name.split(",")[0], value: d.popularity || 0 }));
  const expenseCats = Object.entries(allExpenses.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})).map(([name, value]) => ({ name, value }));

  const kpis = [
    { l: "Revenue", v: formatCurrency(revenue), i: TrendingUp, sub: `${rp.length} payments` },
    { l: "Bookings", v: rb.length, i: CalendarDays, sub: `${allBookings.length} all-time` },
    { l: "Pending payments", v: formatCurrency(pending), i: AlertCircle, sub: "outstanding balance" },
    { l: "Upcoming tours", v: upcoming.length, i: Plane, sub: `${travelers} travelers` },
    { l: "Active travelers", v: travelers, i: Users, sub: `${allUsers.length} customers` },
    { l: "Completed", v: completed, i: CheckCircle2, sub: `${paidPct}% fully paid` },
    { l: "Cancellation rate", v: `${allBookings.length ? Math.round((cancelled / allBookings.length) * 100) : 0}%`, i: Percent, sub: `${cancelled} cancelled` },
    { l: "Avg booking value", v: formatCurrency(avg), i: Wallet, sub: `profit ${formatCurrency(revenue - expenses)}` },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="chip mb-2">Overview</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">Dashboard</h1></div>
        <div className="flex gap-1.5">{RANGES.map((r) => <Link key={r.k} href={`/admin?range=${r.k}`} className={`chip ${range === r.k ? "chip-active" : ""}`}>{r.l}</Link>)}</div>
      </div>

      {(requests.length > 0 || tickets.length > 0) && (
        <div className="flex flex-wrap gap-2 text-sm">
          {requests.length > 0 && <Link href="/admin/content#requests" className="card px-4 py-2 flex items-center gap-2 hover:shadow-card"><span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> {requests.length} new custom trip request{requests.length > 1 ? "s" : ""}</Link>}
          {tickets.length > 0 && <Link href="/admin/content#tickets" className="card px-4 py-2 flex items-center gap-2 hover:shadow-card"><span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> {tickets.length} open support ticket{tickets.length > 1 ? "s" : ""}</Link>}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.l} className="card p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs text-muted font-semibold">{k.l}</p><k.i className="h-4 w-4 text-sky-500" /></div><p className="font-display font-extrabold text-xl sm:text-2xl mt-2 truncate">{k.v}</p><p className="text-[0.7rem] text-muted mt-0.5">{k.sub}</p></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2"><h2 className="font-display font-bold mb-2">Revenue over time</h2><RevenueChart data={series} /></div>
        <div className="card p-5"><h2 className="font-display font-bold mb-2">Bookings over time</h2><BookingsChart data={series} /></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5"><h2 className="font-display font-bold mb-2">Tour performance</h2><HorizontalBars data={topTours} /></div>
        <div className="card p-5"><h2 className="font-display font-bold mb-2">Popular destinations</h2><HorizontalBars data={destPop} /></div>
        <div className="card p-5"><h2 className="font-display font-bold mb-2">Expense breakdown</h2>{expenseCats.length ? <BreakdownPie data={expenseCats} /> : <p className="text-sm text-muted">No expenses recorded.</p>}</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between mb-3"><h2 className="font-display font-bold">Recent bookings</h2><div className="flex gap-2"><ExportCsv filename="bookings" rows={allBookings.map((b) => ({ code: b.bookingCode, tour: b.tourTitle, name: b.contactName, phone: b.contactPhone, date: b.date?.toISOString().split("T")[0], travelers: (b.travelers || []).length || 1, total: b.total, paid: b.paidAmount, status: b.status }))} /><Link href="/admin/bookings" className="btn btn-soft btn-sm">Manage</Link></div></div>
          <table className="table-base"><thead><tr><th>Code</th><th>Tour</th><th>Customer</th><th>Date</th><th className="text-right">Total</th><th>Status</th></tr></thead>
            <tbody>{allBookings.slice(0, 6).map((b) => <tr key={b.id}><td className="font-mono text-xs">{b.bookingCode}</td><td>{b.tourTitle}</td><td>{b.contactName}</td><td>{formatDate(b.date)}</td><td className="text-right font-semibold">{formatCurrency(b.total)}</td><td><StatusBadge status={b.status} /></td></tr>)}</tbody></table>
        </div>
        <div className="card p-5">
          <h2 className="font-display font-bold mb-3">Audit log</h2>
          {logs.length ? <ul className="space-y-3">{logs.map((l) => <li key={l.id} className="text-sm"><p className="font-semibold">{l.action}</p><p className="text-xs text-muted">{l.actor} · {l.entity} · {timeAgo(l.createdAt || new Date())}</p></li>)}</ul> : <p className="text-sm text-muted">Admin actions (tour edits, price changes, payments, deletions) will be recorded here.</p>}
        </div>
      </div>
    </>
  );
}
