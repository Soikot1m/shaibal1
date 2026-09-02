import { db } from "@/db";
import { reviews, supportTickets, customTripRequests, contactSubmissions, newsletterSubscribers, users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSiteSettings } from "@/lib/content";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StarRating, StatusBadge } from "@/components/ui";
import { SettingsForm, AnnouncementForm, ReviewActions, TicketReply, RequestStatus, ExportCsv } from "@/components/admin-widgets";

export default async function AdminContent() {
  const [s, revs, tickets, requests, contacts, subs, customers] = await Promise.all([
    getSiteSettings(), db.select().from(reviews).orderBy(desc(reviews.createdAt)), db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt)),
    db.select().from(customTripRequests).orderBy(desc(customTripRequests.createdAt)), db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(20),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)), db.select().from(users).orderBy(desc(users.createdAt)),
  ]);

  return (
    <>
      <div><p className="chip mb-2">CMS</p><h1 className="font-display font-extrabold text-2xl sm:text-3xl">Content &amp; Settings</h1></div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card p-5" id="settings"><h2 className="font-display font-bold text-lg mb-1">Brand &amp; contact settings</h2><p className="text-xs text-muted mb-4">Shown in the navbar, footer, contact page and structured data. Replace bracketed placeholders with real details.</p><SettingsForm initial={s} /></section>
        <div className="space-y-4">
          <section className="card p-5" id="announce"><h2 className="font-display font-bold text-lg mb-1">Send announcement</h2><p className="text-xs text-muted mb-4">Delivered to every traveler&apos;s notification center (weather alerts, delays, schedule updates). Email/SMS/WhatsApp providers can be attached via env keys.</p><AnnouncementForm /></section>
          <section className="card p-5"><div className="flex items-center justify-between mb-2"><h2 className="font-display font-bold text-lg">Customers ({customers.length})</h2><ExportCsv filename="customers" rows={customers.map((u) => ({ name: u.name, email: u.email, phone: u.phone, role: u.role, joined: u.createdAt?.toISOString().split("T")[0] }))} /></div><ul className="text-sm divide-y divide-line max-h-56 overflow-auto">{customers.map((u) => <li key={u.id} className="py-2 flex justify-between gap-2"><span>{u.name} <span className="text-muted text-xs">{u.email}</span></span><span className="chip !text-xs">{u.role}</span></li>)}</ul></section>
        </div>
      </div>

      <section className="card p-5" id="requests">
        <h2 className="font-display font-bold text-lg mb-3">Custom trip requests ({requests.length})</h2>
        {requests.length ? <div className="space-y-3">{requests.map((r) => <div key={r.id} className="p-4 rounded-2xl border border-line grid md:grid-cols-[1fr_auto] gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{r.name}</p><span className="text-xs text-muted">{r.phone} · {r.email}</span><StatusBadge status={r.status || "new"} /></div><p className="text-sm mt-1"><b>{r.destination}</b> · {formatDate(r.startDate)} → {formatDate(r.endDate)} · {r.travelers} travelers · budget {formatCurrency(r.budget)}/person</p>{r.requirements && <p className="text-xs text-muted mt-1">{r.requirements}</p>}</div><RequestStatus id={r.id} status={r.status || "new"} /></div>)}</div> : <p className="text-sm text-muted">No custom requests yet.</p>}
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card p-5" id="reviews">
          <h2 className="font-display font-bold text-lg mb-3">Review moderation ({revs.length})</h2>
          <div className="space-y-3 max-h-[520px] overflow-auto pr-1">{revs.map((r) => <div key={r.id} className="p-3 rounded-xl border border-line"><div className="flex items-center justify-between gap-2"><div><p className="font-semibold text-sm">{r.author} <span className="text-xs text-muted">· {r.travelDate}</span></p><StarRating value={r.rating} /></div><div className="flex items-center gap-2"><StatusBadge status={r.status} /><ReviewActions id={r.id} status={r.status} /></div></div><p className="text-sm text-muted mt-2">{r.content}</p></div>)}</div>
        </section>
        <section className="card p-5" id="tickets">
          <h2 className="font-display font-bold text-lg mb-3">Support tickets ({tickets.length})</h2>
          {tickets.length ? <div className="space-y-3 max-h-[520px] overflow-auto pr-1">{tickets.map((t) => <div key={t.id} className="p-3 rounded-xl border border-line"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-sm">{t.subject}</p><div className="flex gap-1"><span className="chip !text-xs">{t.priority}</span><StatusBadge status={t.status || "open"} /></div></div><p className="text-xs text-muted">{t.name} · {t.email} · {t.category} · {formatDate(t.createdAt)}</p><p className="text-sm mt-2">{t.message}</p><TicketReply id={t.id} reply={t.reply || ""} status={t.status || "open"} /></div>)}</div> : <p className="text-sm text-muted">No tickets.</p>}
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card p-5"><h2 className="font-display font-bold text-lg mb-3">Contact messages ({contacts.length})</h2>{contacts.length ? <ul className="divide-y divide-line text-sm max-h-72 overflow-auto">{contacts.map((c) => <li key={c.id} className="py-2"><p className="font-semibold">{c.name} <span className="text-xs text-muted font-normal">{c.email} {c.phone} · {formatDate(c.createdAt)}</span></p>{c.subject && <p className="text-xs font-medium">{c.subject}</p>}<p className="text-muted">{c.message}</p></li>)}</ul> : <p className="text-sm text-muted">No messages yet.</p>}</section>
        <section className="card p-5"><div className="flex items-center justify-between mb-3"><h2 className="font-display font-bold text-lg">Newsletter ({subs.length})</h2><ExportCsv filename="newsletter" rows={subs.map((x) => ({ email: x.email, date: x.createdAt?.toISOString() }))} /></div><ul className="text-sm text-muted max-h-72 overflow-auto">{subs.map((x) => <li key={x.id}>{x.email}</li>)}{subs.length === 0 && <li>No subscribers yet.</li>}</ul></section>
      </div>
    </>
  );
}
