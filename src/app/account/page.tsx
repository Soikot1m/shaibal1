import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { favorites, notifications, payments, tours, destinations, supportTickets } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { getBookingsByUser } from "@/lib/data";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { Avatar, StatusBadge } from "@/components/ui";
import { TourCard, DestinationCard } from "@/components/cards";
import { BookingQR, TripProgress } from "@/components/booking-widgets";
import { ProfileForm, LogoutButton, MarkReadButton } from "@/components/account-widgets";
import { CalendarDays, Wallet, Heart, Bell, User, LifeBuoy, Compass, Plane, FileText, LayoutDashboard } from "lucide-react";

export const metadata = { title: "My Account" };

const TABS = [
  { k: "overview", l: "Overview", i: LayoutDashboard },
  { k: "bookings", l: "My Bookings", i: CalendarDays },
  { k: "payments", l: "Payments & Invoices", i: Wallet },
  { k: "saved", l: "Saved", i: Heart },
  { k: "notifications", l: "Notifications", i: Bell },
  { k: "profile", l: "Profile", i: User },
  { k: "support", l: "Support", i: LifeBuoy },
];

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const { tab = "overview" } = await searchParams;

  const [bookings, favs, notes, tickets] = await Promise.all([
    getBookingsByUser(user.id),
    db.select().from(favorites).where(eq(favorites.userId, user.id)),
    db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(20),
    db.select().from(supportTickets).where(eq(supportTickets.userId, user.id)).orderBy(desc(supportTickets.createdAt)),
  ]);
  const bookingIds = bookings.map((b) => b.id);
  const pays = bookingIds.length ? await db.select().from(payments).where(inArray(payments.bookingId, bookingIds)).orderBy(desc(payments.createdAt)) : [];
  const favTourIds = favs.filter((f) => f.entityType === "tour").map((f) => f.entityId);
  const favDestIds = favs.filter((f) => f.entityType === "destination").map((f) => f.entityId);
  const [savedTours, savedDests] = await Promise.all([
    favTourIds.length ? db.select().from(tours).where(inArray(tours.id, favTourIds)) : Promise.resolve([]),
    favDestIds.length ? db.select().from(destinations).where(inArray(destinations.id, favDestIds)) : Promise.resolve([]),
  ]);

  const now = new Date();
  const upcoming = bookings.filter((b) => b.date && b.date >= now && b.status !== "cancelled");
  const past = bookings.filter((b) => !b.date || b.date < now || b.status === "completed");
  const active = bookings.find((b) => (b.progress || 0) > 0 && (b.progress || 0) < 100 && b.status !== "cancelled");
  const totalPaid = pays.reduce((a, p) => a + p.amount, 0);
  const due = bookings.reduce((a, b) => a + Math.max(0, (b.total || 0) - (b.paidAmount || 0)), 0);
  const unread = notes.filter((n) => !n.read).length;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  const BookingCard = ({ b }: { b: (typeof bookings)[number] }) => (
    <div className="card p-5 grid sm:grid-cols-[1fr_auto] gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-bold">{b.tourTitle}</h3><StatusBadge status={b.status} /></div>
        <p className="text-xs text-muted mt-1 font-mono">{b.bookingCode}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-sky-500" /> {formatDate(b.date)}</span>
          <span>👥 {(b.travelers || []).length || 1} traveler{((b.travelers || []).length || 1) > 1 ? "s" : ""}</span>
          <span className="font-semibold">{formatCurrency(b.total)}</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1"><span className="text-muted">Payment progress</span><span className="font-semibold">{formatCurrency(b.paidAmount)} / {formatCurrency(b.total)}</span></div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.round(((b.paidAmount || 0) / Math.max(1, b.total || 1)) * 100))}%` }} /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={`/booking/confirmation/${b.id}`} className="btn btn-primary btn-sm">View details</Link>
          <Link href={`/verify/${b.bookingCode}`} className="btn btn-ghost btn-sm">Verify</Link>
        </div>
      </div>
      <div className="hidden sm:block"><BookingQR value={`${base}/verify/${b.bookingCode}`} size={92} /></div>
    </div>
  );

  return (
    <div className="container-x pt-24 pb-16">
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Avatar name={user.name} size={56} />
        <div className="flex-1"><p className="text-sm text-muted">Welcome back</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">{user.name}</h1></div>
        {user.isAdmin && <Link href="/admin" className="btn btn-soft btn-sm">Admin panel</Link>}
        <LogoutButton />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0" aria-label="Account sections">
          {TABS.map((t) => (
            <Link key={t.k} href={`/account?tab=${t.k}`} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${tab === t.k ? "gradient-brand text-white shadow-float" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
              <t.i className="h-4 w-4" /> {t.l} {t.k === "notifications" && unread > 0 && <span className="ml-auto text-[0.65rem] bg-rose-500 text-white rounded-full px-1.5">{unread}</span>}
            </Link>
          ))}
        </nav>

        <div className="space-y-6 min-w-0">
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[{ l: "Upcoming trips", v: upcoming.length, i: Plane }, { l: "Total bookings", v: bookings.length, i: CalendarDays }, { l: "Paid", v: formatCurrency(totalPaid), i: Wallet }, { l: "Balance due", v: formatCurrency(due), i: FileText }].map((s) => (
                  <div key={s.l} className="card p-4"><s.i className="h-5 w-5 text-sky-500 mb-2" /><p className="text-xs text-muted">{s.l}</p><p className="font-display font-extrabold text-xl">{s.v}</p></div>
                ))}
              </div>
              {active && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-3"><h2 className="font-display font-bold text-lg">Live trip · {active.tourTitle}</h2><span className="chip"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live</span></div>
                  <TripProgress steps={active.progressJson || []} progress={active.progress || 0} />
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3"><h2 className="font-display font-bold text-lg">Upcoming trips</h2><Link href="/account?tab=bookings" className="text-sm text-sky-600">See all</Link></div>
                {upcoming.length ? <div className="space-y-3">{upcoming.slice(0, 2).map((b) => <BookingCard key={b.id} b={b} />)}</div> : (
                  <div className="card p-8 text-center"><Compass className="h-8 w-8 text-sky-500 mx-auto" /><p className="font-semibold mt-2">No upcoming trips yet</p><Link href="/tours" className="btn btn-primary btn-sm mt-3">Explore tours</Link></div>
                )}
              </div>
            </>
          )}

          {tab === "bookings" && (
            <>
              <h2 className="font-display font-bold text-lg">Upcoming ({upcoming.length})</h2>
              {upcoming.length ? upcoming.map((b) => <BookingCard key={b.id} b={b} />) : <p className="card p-6 text-sm text-muted">No upcoming bookings.</p>}
              <h2 className="font-display font-bold text-lg pt-4">Past & completed ({past.length})</h2>
              {past.length ? past.map((b) => <BookingCard key={b.id} b={b} />) : <p className="card p-6 text-sm text-muted">No past trips yet.</p>}
            </>
          )}

          {tab === "payments" && (
            <div className="card p-5 overflow-x-auto">
              <h2 className="font-display font-bold text-lg mb-4">Payment history</h2>
              {pays.length ? (
                <table className="table-base"><thead><tr><th>Date</th><th>Booking</th><th>Gateway</th><th>Transaction</th><th>Status</th><th className="text-right">Amount</th><th></th></tr></thead>
                  <tbody>{pays.map((p) => { const b = bookings.find((x) => x.id === p.bookingId); return (<tr key={p.id}><td>{formatDate(p.createdAt)}</td><td>{b?.bookingCode}</td><td>{p.gateway}</td><td className="font-mono text-xs">{p.transactionId}</td><td><StatusBadge status={p.status || "pending"} /></td><td className="text-right font-semibold">{formatCurrency(p.amount)}</td><td><Link href={`/booking/confirmation/${p.bookingId}`} className="text-sky-600 text-xs">Invoice</Link></td></tr>); })}</tbody></table>
              ) : <p className="text-sm text-muted">No payments recorded yet.</p>}
            </div>
          )}

          {tab === "saved" && (
            <>
              <h2 className="font-display font-bold text-lg">Saved tours ({savedTours.length})</h2>
              {savedTours.length ? <div className="grid sm:grid-cols-2 gap-4">{savedTours.map((t) => <TourCard key={t.id} tour={t} />)}</div> : <p className="card p-6 text-sm text-muted">Tap the heart on any tour to save it here.</p>}
              <h2 className="font-display font-bold text-lg pt-4">Saved destinations ({savedDests.length})</h2>
              {savedDests.length ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{savedDests.map((d) => <DestinationCard key={d.id} dest={d} />)}</div> : <p className="card p-6 text-sm text-muted">No saved destinations yet.</p>}
            </>
          )}

          {tab === "notifications" && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="font-display font-bold text-lg">Notification center</h2>{unread > 0 && <MarkReadButton />}</div>
              {notes.length ? <ul className="divide-y divide-line">{notes.map((n) => <li key={n.id} className="py-3 flex gap-3"><span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-gray-300" : "bg-sky-500"}`} /><div><p className="font-semibold text-sm">{n.title}</p><p className="text-sm text-muted">{n.message}</p><p className="text-xs text-muted mt-1">{timeAgo(n.createdAt || new Date())} · {n.type}</p></div></li>)}</ul> : <p className="text-sm text-muted">You&apos;re all caught up. Booking confirmations, payment reminders, schedule updates and alerts will appear here.</p>}
            </div>
          )}

          {tab === "profile" && (
            <div className="card p-6"><h2 className="font-display font-bold text-lg mb-4">Profile</h2><ProfileForm name={user.name} phone={user.phone || ""} email={user.email} /><p className="text-xs text-muted mt-4">Role: {user.role} · Member since {formatDate(user.createdAt)}</p></div>
          )}

          {tab === "support" && (
            <div className="space-y-4">
              <div className="card p-6 flex flex-wrap items-center gap-3"><LifeBuoy className="h-6 w-6 text-sky-500" /><div className="flex-1"><p className="font-semibold">Need help with a booking?</p><p className="text-sm text-muted">Open a ticket or reach us on WhatsApp.</p></div><Link href="/contact#support" className="btn btn-primary btn-sm">New ticket</Link></div>
              <div className="card p-5"><h3 className="font-semibold mb-3">My tickets ({tickets.length})</h3>{tickets.length ? <ul className="divide-y divide-line">{tickets.map((t) => <li key={t.id} className="py-3"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-sm">{t.subject}</p><StatusBadge status={t.status || "open"} /></div><p className="text-xs text-muted mt-1">{t.category} · {t.priority} · {formatDate(t.createdAt)}</p>{t.reply && <p className="text-sm mt-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10"><b>Reply:</b> {t.reply}</p>}</li>)}</ul> : <p className="text-sm text-muted">No tickets yet.</p>}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
