"use client";
import { run } from "@/lib/action";
import { useState } from "react";
import { Send, Sparkles, LifeBuoy } from "lucide-react";
import { submitContact, submitCustomTrip, submitSupportTicket } from "@/app/actions";
import { toast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await run(submitContact(f));
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(res.message, "success", "Message sent");
    setDone(true);
  };
  if (done) return <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-center"><p className="font-display font-bold text-lg">Thanks — we&apos;ve received your message.</p><p className="text-sm text-muted mt-1">Our team will reply within business hours.</p></div>;
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <label className="field">Name<input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="field">Email<input type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="field">Phone<input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+880…" /></label>
      <label className="field">Subject<input className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>
      <label className="field sm:col-span-2">Message<textarea required rows={5} className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <button disabled={busy} className="btn btn-primary sm:col-span-2"><Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}

const INTERESTS = ["Hills & trekking", "Beach", "Wildlife", "Culture & heritage", "Food", "Photography", "Family-friendly", "Honeymoon"];

export function CustomTripForm({ defaultDestination = "" }: { defaultDestination?: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", destination: defaultDestination, startDate: "", endDate: "", travelers: 2, budget: 10000, transport: "AC Bus", hotel: "Standard", guide: true, meals: "Breakfast included", interests: [] as string[], requirements: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const days = f.startDate && f.endDate ? Math.max(1, Math.round((new Date(f.endDate).getTime() - new Date(f.startDate).getTime()) / 86400000) + 1) : 3;
  const hotelRate = f.hotel === "Premium" ? 6000 : f.hotel === "Deluxe" ? 3500 : 1800;
  const transportRate = f.transport === "Private car" ? 4500 : f.transport === "Microbus" ? 2500 : f.transport === "Flight" ? 9000 : 1500;
  const est = (hotelRate * Math.max(1, days - 1) + transportRate * days + (f.guide ? 1500 * days : 0) + 800 * days) * f.travelers;

  const toggle = (i: string) => setF({ ...f, interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await run(submitCustomTrip({
      name: f.name, email: f.email, phone: f.phone, destination: f.destination, startDate: f.startDate || undefined, endDate: f.endDate || undefined,
      travelers: f.travelers, budget: f.budget,
      requirements: [`Transport: ${f.transport}`, `Hotel: ${f.hotel}`, `Guide: ${f.guide ? "Yes" : "No"}`, `Meals: ${f.meals}`, `Interests: ${f.interests.join(", ") || "—"}`, `Estimated: ${formatCurrency(est)}`, f.requirements].join(" | "),
    }));
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(res.message, "success", "Request received");
    setDone(true);
  };

  if (done) return <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-center"><Sparkles className="h-8 w-8 text-emerald-600 mx-auto" /><p className="font-display font-bold text-xl mt-2">Your custom tour request is in!</p><p className="text-sm text-muted mt-1">We&apos;ll design an itinerary and get back to you with a quote.</p></div>;

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="field">Your name<input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="field">Phone / WhatsApp<input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+880…" /></label>
        <label className="field">Email<input type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="field">Destination<input required className="input" value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} placeholder="Bandarban, Cox's Bazar, Nepal…" /></label>
        <label className="field">Start date<input type="date" className="input" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></label>
        <label className="field">End date<input type="date" className="input" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></label>
        <label className="field">Travelers<input type="number" min={1} max={100} className="input" value={f.travelers} onChange={(e) => setF({ ...f, travelers: Number(e.target.value) })} /></label>
        <label className="field">Budget per person (৳)<input type="number" min={0} step={500} className="input" value={f.budget} onChange={(e) => setF({ ...f, budget: Number(e.target.value) })} /></label>
        <label className="field">Transport<select className="input" value={f.transport} onChange={(e) => setF({ ...f, transport: e.target.value })}><option>AC Bus</option><option>Microbus</option><option>Private car</option><option>Train</option><option>Flight</option></select></label>
        <label className="field">Hotel level<select className="input" value={f.hotel} onChange={(e) => setF({ ...f, hotel: e.target.value })}><option>Standard</option><option>Deluxe</option><option>Premium</option></select></label>
        <label className="field">Meals<select className="input" value={f.meals} onChange={(e) => setF({ ...f, meals: e.target.value })}><option>Breakfast included</option><option>Half board</option><option>Full board</option><option>No meals</option></select></label>
        <label className="field justify-end"><span className="flex items-center gap-2 h-[42px]"><input type="checkbox" checked={f.guide} onChange={(e) => setF({ ...f, guide: e.target.checked })} /> Include local guide</span></label>
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold mb-2">Interests</p>
          <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button type="button" key={i} onClick={() => toggle(i)} className={`chip ${f.interests.includes(i) ? "chip-active" : ""}`}>{i}</button>)}</div>
        </div>
        <label className="field sm:col-span-2">Special requirements<textarea rows={3} className="input" value={f.requirements} onChange={(e) => setF({ ...f, requirements: e.target.value })} placeholder="Accessibility, dietary needs, celebrations…" /></label>
      </div>
      <aside className="card p-5 h-fit lg:sticky lg:top-24">
        <p className="text-xs text-muted uppercase tracking-wide font-semibold">Live estimate</p>
        <p className="font-display font-extrabold text-3xl mt-1">{formatCurrency(est)}</p>
        <p className="text-xs text-muted">≈ {formatCurrency(Math.round(est / f.travelers))} per person · {days} day{days > 1 ? "s" : ""}</p>
        <ul className="text-sm mt-4 space-y-1.5 text-muted">
          <li>🗺 {f.destination || "Destination"}</li>
          <li>🚌 {f.transport}</li>
          <li>🏨 {f.hotel} hotel</li>
          <li>🍽 {f.meals}</li>
          <li>👥 {f.travelers} traveler{f.travelers > 1 ? "s" : ""}</li>
          <li>🧭 Guide: {f.guide ? "included" : "not included"}</li>
        </ul>
        <p className="text-[0.68rem] text-muted mt-3">Indicative only — final quote after review.</p>
        <button disabled={busy} className="btn btn-primary w-full mt-4"><Sparkles className="h-4 w-4" /> {busy ? "Sending…" : "Request Custom Tour"}</button>
      </aside>
    </form>
  );
}

export function TicketForm() {
  const [f, setF] = useState({ name: "", email: "", subject: "", category: "Booking", priority: "normal", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await run(submitSupportTicket(f));
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast(res.message, "success");
    setDone(true);
  };
  if (done) return <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-center"><LifeBuoy className="h-7 w-7 text-emerald-600 mx-auto" /><p className="font-semibold mt-2">Ticket created — we&apos;ll follow up soon.</p></div>;
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <label className="field">Name<input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="field">Email<input type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="field">Category<select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Booking", "Payment", "Hotels", "Transport", "Cancellation", "Travel documents", "Other"].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="field">Priority<select className="input" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      <label className="field sm:col-span-2">Subject<input required className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>
      <label className="field sm:col-span-2">Message<textarea required rows={4} className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      <button disabled={busy} className="btn btn-primary sm:col-span-2">{busy ? "Submitting…" : "Open support ticket"}</button>
    </form>
  );
}
