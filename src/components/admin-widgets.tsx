"use client";
import { run } from "@/lib/action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Trash2, Check, Clock, AlertTriangle, XCircle, Send, Copy, Eye, EyeOff, Star } from "lucide-react";
import * as A from "@/app/admin/actions";
import { toast } from "@/lib/toast";
import type { ProgressStep } from "@/db/schema";
import type { SiteSettings } from "@/lib/content";

type Res = { ok: true; message: string } | { ok: false; error: string };
function useAct() {
  const router = useRouter();
  return async (p: Promise<Res>) => {
    const r = await run(p);
    toast(r.ok ? r.message : r.error, r.ok ? "success" : "error");
    if (r.ok) router.refresh();
    return r.ok;
  };
}

export function ExportCsv({ rows, filename, label = "Export CSV" }: { rows: Record<string, unknown>[]; filename: string; label?: string }) {
  const download = () => {
    if (!rows.length) return toast("Nothing to export", "warning");
    const keys = Object.keys(rows[0]);
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={download} className="btn btn-ghost btn-sm"><Download className="h-4 w-4" /> {label}</button>;
}

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const act = useAct();
  return (
    <select className="input !w-auto !py-1.5 text-xs" value={value} onChange={(e) => act(A.setBookingStatus(id, e.target.value))} aria-label="Booking status">
      {["pending", "confirmed", "partially_paid", "paid", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
    </select>
  );
}

export function RecordPaymentForm({ bookingId, remaining }: { bookingId: string; remaining: number }) {
  const act = useAct();
  const [amount, setAmount] = useState(remaining);
  const [gateway, setGateway] = useState("bKash");
  const [ref, setRef] = useState("");
  if (remaining <= 0) return <span className="text-xs text-emerald-600 font-semibold">Paid in full</span>;
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (await act(A.adminRecordPayment({ bookingId, amount, gateway, reference: ref }))) setRef(""); }} className="flex flex-wrap gap-1.5 items-center">
      <input type="number" min={1} className="input !w-28 !py-1.5 text-xs" value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Amount" />
      <select className="input !w-auto !py-1.5 text-xs" value={gateway} onChange={(e) => setGateway(e.target.value)}>{["bKash", "Nagad", "Cash", "Bank", "SSLCommerz"].map((g) => <option key={g}>{g}</option>)}</select>
      <input className="input !w-28 !py-1.5 text-xs" placeholder="Txn ref" value={ref} onChange={(e) => setRef(e.target.value)} />
      <button className="btn btn-primary btn-sm !py-1.5">Record</button>
    </form>
  );
}

const STATUSES: ProgressStep["status"][] = ["completed", "upcoming", "delayed", "cancelled"];
const sIcon = { completed: Check, upcoming: Clock, delayed: AlertTriangle, cancelled: XCircle };
const sTone = { completed: "bg-emerald-500 text-white", upcoming: "bg-gray-200 dark:bg-white/10", delayed: "bg-amber-400 text-white", cancelled: "bg-rose-500 text-white" };

export function ProgressEditor({ bookingId, steps: initial }: { bookingId: string; steps: ProgressStep[] }) {
  const act = useAct();
  const [steps, setSteps] = useState<ProgressStep[]>(initial.length ? initial : ["Planning", "Booking", "Departure", "Transit", "Hotel Check-in", "Destination Activities", "Return Journey", "Completed"].map((l, i) => ({ id: `s${i}`, label: l, status: "upcoming" as const })));
  const [update, setUpdate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const cycle = (i: number) => setSteps(steps.map((s, j) => (j === i ? { ...s, status: STATUSES[(STATUSES.indexOf(s.status) + 1) % STATUSES.length] } : s)));
  const pct = Math.round((steps.filter((s) => s.status === "completed").length / Math.max(1, steps.length)) * 100);
  return (
    <div className="space-y-3">
      <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden"><div className="h-full gradient-brand" style={{ width: `${pct}%` }} /></div>
      <ul className="space-y-1.5">
        {steps.map((s, i) => {
          const I = sIcon[s.status];
          return (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => cycle(i)} className={`grid place-items-center h-6 w-6 rounded-full shrink-0 ${sTone[s.status]}`} title={`${s.status} — click to change`} aria-label={`Toggle ${s.label}`}><I className="h-3.5 w-3.5" /></button>
              <span className="font-medium w-40 truncate">{s.label}</span>
              <input className="input !py-1 text-xs flex-1" placeholder="Detail (e.g. Bus departed 6:00 AM)" value={s.detail || ""} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} />
              <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-rose-500 p-1" aria-label="Remove step"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2"><input className="input !py-1.5 text-xs" placeholder="Add stage…" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} /><button type="button" onClick={() => { if (newLabel.trim()) { setSteps([...steps, { id: `s${Date.now()}`, label: newLabel.trim(), status: "upcoming" }]); setNewLabel(""); } }} className="btn btn-soft btn-sm"><Plus className="h-4 w-4" /></button></div>
      <div className="flex gap-2"><input className="input !py-1.5 text-xs" placeholder="Live update to traveler (optional): Hotel check-in completed" value={update} onChange={(e) => setUpdate(e.target.value)} /><button type="button" onClick={async () => { if (await act(A.updateProgress(bookingId, steps, update))) setUpdate(""); }} className="btn btn-primary btn-sm"><Send className="h-4 w-4" /> Save</button></div>
    </div>
  );
}

export function TourStatusButtons({ id, status }: { id: string; status: string }) {
  const act = useAct();
  return (
    <div className="flex gap-1">
      <button onClick={() => act(A.setTourStatus(id, status === "published" ? "draft" : "published"))} className="btn btn-ghost btn-sm !px-2" title={status === "published" ? "Unpublish" : "Publish"}>{status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      <button onClick={() => act(A.duplicateTour(id))} className="btn btn-ghost btn-sm !px-2" title="Duplicate"><Copy className="h-4 w-4" /></button>
    </div>
  );
}

export function AddDateForm({ tourId }: { tourId: string }) {
  const act = useAct();
  const [f, setF] = useState({ date: "", seats: 24, price: 0 });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await act(A.addTourDate({ tourId, date: f.date, seats: f.seats, price: f.price || undefined })); }} className="flex flex-wrap gap-1.5">
      <input type="date" required className="input !w-auto !py-1.5 text-xs" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
      <input type="number" min={1} className="input !w-20 !py-1.5 text-xs" value={f.seats} onChange={(e) => setF({ ...f, seats: Number(e.target.value) })} title="Seats" />
      <input type="number" min={0} className="input !w-24 !py-1.5 text-xs" placeholder="Price" value={f.price || ""} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
      <button className="btn btn-soft btn-sm !py-1.5"><Plus className="h-4 w-4" /> Date</button>
    </form>
  );
}

type TourInit = { id?: string; title?: string; subtitle?: string; category?: string; description?: string; durationDays?: number; durationNights?: number; price?: number; discountPrice?: number | null; departureCity?: string; difficulty?: string; groupSize?: number; featured?: boolean; status?: string; image?: string; gallery?: string; highlights?: string; included?: string; excluded?: string; itinerary?: string; destinationId?: string | null; cancellationPolicy?: string };

export function TourForm({ initial, destinations, onDone }: { initial?: TourInit; destinations: { id: string; name: string }[]; onDone?: () => void }) {
  const act = useAct();
  const [f, setF] = useState<TourInit>({ category: "Adventure", difficulty: "Easy", durationDays: 3, durationNights: 2, price: 0, groupSize: 20, departureCity: "Bogura", status: "published", featured: false, ...initial });
  const set = (k: keyof TourInit, v: unknown) => setF({ ...f, [k]: v });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (await act(A.saveTour(f as Record<string, unknown>))) onDone?.(); }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <label className="field lg:col-span-2">Title<input required className="input" value={f.title || ""} onChange={(e) => set("title", e.target.value)} /></label>
      <label className="field">Category<select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>{["Adventure", "Beach", "Mountains", "Nature", "Cultural", "International", "Custom"].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="field lg:col-span-2">Subtitle<input className="input" value={f.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></label>
      <label className="field">Destination<select className="input" value={f.destinationId || ""} onChange={(e) => set("destinationId", e.target.value || null)}><option value="">—</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <label className="field">Days<input type="number" min={0} className="input" value={f.durationDays} onChange={(e) => set("durationDays", Number(e.target.value))} /></label>
      <label className="field">Nights<input type="number" min={0} className="input" value={f.durationNights} onChange={(e) => set("durationNights", Number(e.target.value))} /></label>
      <label className="field">Group size<input type="number" min={1} className="input" value={f.groupSize} onChange={(e) => set("groupSize", Number(e.target.value))} /></label>
      <label className="field">Price (৳)<input type="number" min={0} className="input" value={f.price} onChange={(e) => set("price", Number(e.target.value))} /></label>
      <label className="field">Discount price (৳)<input type="number" min={0} className="input" value={f.discountPrice ?? ""} onChange={(e) => set("discountPrice", e.target.value ? Number(e.target.value) : null)} /></label>
      <label className="field">Departure city<input className="input" value={f.departureCity || ""} onChange={(e) => set("departureCity", e.target.value)} /></label>
      <label className="field">Difficulty<select className="input" value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label>
      <label className="field">Status<select className="input" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="published">Published</option><option value="draft">Draft</option></select></label>
      <label className="field justify-end"><span className="flex items-center gap-2 h-[42px]"><input type="checkbox" checked={!!f.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on homepage</span></label>
      <label className="field lg:col-span-3">Description<textarea rows={3} className="input" value={f.description || ""} onChange={(e) => set("description", e.target.value)} /></label>
      <label className="field lg:col-span-2">Cover image URL<input className="input" placeholder="https://… (uploads: connect storage bucket)" value={f.image || ""} onChange={(e) => set("image", e.target.value)} /></label>
      <label className="field">Gallery URLs (one per line)<textarea rows={2} className="input" value={f.gallery || ""} onChange={(e) => set("gallery", e.target.value)} /></label>
      <label className="field">Highlights (one per line)<textarea rows={3} className="input" value={f.highlights || ""} onChange={(e) => set("highlights", e.target.value)} /></label>
      <label className="field">Included (one per line)<textarea rows={3} className="input" value={f.included || ""} onChange={(e) => set("included", e.target.value)} /></label>
      <label className="field">Excluded (one per line)<textarea rows={3} className="input" value={f.excluded || ""} onChange={(e) => set("excluded", e.target.value)} /></label>
      <label className="field lg:col-span-2">Itinerary (one day per line: Title | Activity)<textarea rows={4} className="input" value={f.itinerary || ""} onChange={(e) => set("itinerary", e.target.value)} placeholder={"Bogura → Bandarban | Drive, check-in, evening walk\nNilgiri & Thanchi | Sunrise, boat ride, waterfall"} /></label>
      <label className="field">Cancellation policy<textarea rows={4} className="input" value={f.cancellationPolicy || ""} onChange={(e) => set("cancellationPolicy", e.target.value)} /></label>
      <div className="lg:col-span-3 flex gap-2"><button className="btn btn-primary">{f.id ? "Save changes" : "Create tour"}</button>{onDone && <button type="button" onClick={onDone} className="btn btn-ghost">Cancel</button>}</div>
    </form>
  );
}

export function ExpenseForm({ trips, defaultTrip }: { trips: { id: string; name: string }[]; defaultTrip?: string }) {
  const act = useAct();
  const [f, setF] = useState({ tripId: defaultTrip || trips[0]?.id || "", category: "Transport", title: "", description: "", amount: 0, paidBy: "", method: "Cash", date: new Date().toISOString().split("T")[0] });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (await act(A.addExpense(f))) setF({ ...f, title: "", description: "", amount: 0 }); }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <label className="field">Trip<select className="input" value={f.tripId} onChange={(e) => setF({ ...f, tripId: e.target.value })}>{trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label className="field">Category<select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Transport", "Hotel", "Food", "Guide", "Entry fees", "Tickets", "Fuel", "Miscellaneous", "Emergency"].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="field">Title<input required className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label className="field">Amount (৳)<input required type="number" min={0} className="input" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></label>
      <label className="field">Paid by<input className="input" value={f.paidBy} onChange={(e) => setF({ ...f, paidBy: e.target.value })} placeholder="Operator / Guide / Driver" /></label>
      <label className="field">Method<select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{["Cash", "bKash", "Nagad", "Bank", "Card"].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="field">Date<input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
      <label className="field">Notes<input className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <button className="btn btn-primary lg:col-span-4 w-fit"><Plus className="h-4 w-4" /> Record expense</button>
    </form>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  const act = useAct();
  return <button onClick={() => { if (confirm("Delete this expense? A copy is kept in the audit log.")) act(A.deleteExpense(id)); }} className="text-rose-500 p-1" aria-label="Delete expense"><Trash2 className="h-4 w-4" /></button>;
}

export function ParticipantForm({ tripId }: { tripId: string }) {
  const act = useAct();
  const [f, setF] = useState({ name: "", phone: "", email: "", age: "", gender: "", seat: "", room: "", emergencyName: "", emergencyPhone: "", paymentStatus: "pending" });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (await act(A.addParticipant({ tripId, ...f, age: f.age ? Number(f.age) : undefined }))) setF({ ...f, name: "", phone: "", email: "", age: "", seat: "", room: "" }); }} className="grid grid-cols-2 lg:grid-cols-5 gap-2">
      <input required className="input !py-1.5 text-sm" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className="input !py-1.5 text-sm" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <input className="input !py-1.5 text-sm" placeholder="Age" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
      <select className="input !py-1.5 text-sm" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
      <input className="input !py-1.5 text-sm" placeholder="Seat" value={f.seat} onChange={(e) => setF({ ...f, seat: e.target.value })} />
      <input className="input !py-1.5 text-sm" placeholder="Room" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
      <input className="input !py-1.5 text-sm" placeholder="Emergency contact" value={f.emergencyName} onChange={(e) => setF({ ...f, emergencyName: e.target.value })} />
      <input className="input !py-1.5 text-sm" placeholder="Emergency phone" value={f.emergencyPhone} onChange={(e) => setF({ ...f, emergencyPhone: e.target.value })} />
      <select className="input !py-1.5 text-sm" value={f.paymentStatus} onChange={(e) => setF({ ...f, paymentStatus: e.target.value })}><option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option></select>
      <button className="btn btn-soft btn-sm"><Plus className="h-4 w-4" /> Add</button>
    </form>
  );
}

export function TripForm({ tours }: { tours: { id: string; title: string }[] }) {
  const act = useAct();
  const [f, setF] = useState({ name: "", tourId: "", route: "Bogura → Chittagong → Bandarban → Cox's Bazar → Bogura", startDate: "", endDate: "", revenue: 0 });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await act(A.createTrip(f)); }} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2">
      <input required className="input lg:col-span-2" placeholder="Trip group name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <select className="input" value={f.tourId} onChange={(e) => setF({ ...f, tourId: e.target.value })}><option value="">Link tour (optional)</option>{tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      <input type="date" className="input" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
      <input type="date" className="input" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} />
      <input type="number" className="input" placeholder="Revenue ৳" value={f.revenue || ""} onChange={(e) => setF({ ...f, revenue: Number(e.target.value) })} />
      <input className="input lg:col-span-5" placeholder="Route: Bogura → Chittagong → …" value={f.route} onChange={(e) => setF({ ...f, route: e.target.value })} />
      <button className="btn btn-primary"><Plus className="h-4 w-4" /> Create trip</button>
    </form>
  );
}

export function ReviewActions({ id, status }: { id: string; status: string }) {
  const act = useAct();
  return (
    <div className="flex gap-1">
      {status !== "approved" && <button onClick={() => act(A.moderateReview(id, "approved"))} className="btn btn-soft btn-sm !px-2" title="Approve"><Check className="h-4 w-4" /></button>}
      {status !== "featured" && <button onClick={() => act(A.moderateReview(id, "featured"))} className="btn btn-soft btn-sm !px-2" title="Feature"><Star className="h-4 w-4" /></button>}
      <button onClick={() => { if (confirm("Reject and delete this review?")) act(A.moderateReview(id, "rejected")); }} className="btn btn-ghost btn-sm !px-2 text-rose-500" title="Reject"><XCircle className="h-4 w-4" /></button>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const act = useAct();
  const [s, setS] = useState(initial);
  const fields: { k: keyof SiteSettings; l: string; wide?: boolean }[] = [
    { k: "brand", l: "Brand name" }, { k: "tagline", l: "Tagline" }, { k: "heroTitle", l: "Hero title", wide: true }, { k: "heroSubtitle", l: "Hero subtitle", wide: true },
    { k: "phone", l: "Phone" }, { k: "whatsapp", l: "WhatsApp" }, { k: "email", l: "Email" }, { k: "address", l: "Office address" }, { k: "hours", l: "Business hours" },
    { k: "facebook", l: "Facebook URL" }, { k: "instagram", l: "Instagram URL" }, { k: "youtube", l: "YouTube URL" }, { k: "tiktok", l: "TikTok URL" },
  ];
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await act(A.saveSettings(s)); }} className="grid sm:grid-cols-2 gap-3">
      {fields.map((f) => <label key={f.k} className={`field ${f.wide ? "sm:col-span-2" : ""}`}>{f.l}<input className="input" value={s[f.k]} onChange={(e) => setS({ ...s, [f.k]: e.target.value })} /></label>)}
      <button className="btn btn-primary w-fit">Save settings</button>
    </form>
  );
}

export function AnnouncementForm() {
  const act = useAct();
  const [f, setF] = useState({ title: "", message: "", type: "general" });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (await act(A.sendAnnouncement(f))) setF({ title: "", message: "", type: "general" }); }} className="grid gap-2">
      <div className="grid sm:grid-cols-[1fr_auto] gap-2"><input required className="input" placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["general", "schedule", "delay", "weather", "hotel", "emergency", "payment"].map((t) => <option key={t}>{t}</option>)}</select></div>
      <textarea required rows={3} className="input" placeholder="Message to all travelers…" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      <button className="btn btn-primary w-fit"><Send className="h-4 w-4" /> Send notification</button>
    </form>
  );
}

export function TicketReply({ id, reply, status }: { id: string; reply: string; status: string }) {
  const act = useAct();
  const [r, setR] = useState(reply);
  const [s, setS] = useState(status);
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await act(A.replyTicket(id, r, s)); }} className="flex flex-wrap gap-2 mt-2">
      <input className="input flex-1 !py-1.5 text-sm" placeholder="Reply to traveler…" value={r} onChange={(e) => setR(e.target.value)} />
      <select className="input !w-auto !py-1.5 text-sm" value={s} onChange={(e) => setS(e.target.value)}>{["open", "pending", "resolved", "closed"].map((x) => <option key={x}>{x}</option>)}</select>
      <button className="btn btn-soft btn-sm">Update</button>
    </form>
  );
}

export function RequestStatus({ id, status }: { id: string; status: string }) {
  const act = useAct();
  return <select className="input !w-auto !py-1.5 text-xs" value={status} onChange={(e) => act(A.setRequestStatus(id, e.target.value))}>{["new", "quoted", "confirmed", "closed"].map((s) => <option key={s}>{s}</option>)}</select>;
}

export function FeatureToggle({ id, featured }: { id: string; featured: boolean }) {
  const act = useAct();
  return <button onClick={() => act(A.setDestinationFeatured(id, !featured))} className={`chip ${featured ? "chip-active" : ""}`}>{featured ? "Featured" : "Feature"}</button>;
}
