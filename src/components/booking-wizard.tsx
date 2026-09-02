"use client";
import { run } from "@/lib/action";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays, Users, Wallet, ShieldCheck } from "lucide-react";
import { createBooking } from "@/app/actions";
import { toast } from "@/lib/toast";
import { formatCurrency, formatDate } from "@/lib/utils";

type DateOpt = { id: string; date: string; seatsLeft: number; price: number };
type Props = {
  tour: { id: string; slug: string; title: string; price: number; image: string; duration: string; departure: string };
  dates: DateOpt[];
  initialDate?: string;
  user?: { name: string; email: string; phone?: string | null } | null;
};

const STEPS = ["Date", "Travelers", "Emergency", "Preferences", "Review", "Payment"];

export function BookingWizard({ tour, dates, initialDate, user }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dateId, setDateId] = useState(dates.find((d) => d.date === initialDate)?.id || dates[0]?.id || "");
  const [customDate, setCustomDate] = useState(initialDate || "");
  const [contact, setContact] = useState({ name: user?.name || "", phone: user?.phone || "", email: user?.email || "" });
  const [travelers, setTravelers] = useState([{ name: user?.name || "", age: "", gender: "" }]);
  const [emergency, setEmergency] = useState({ name: "", phone: "" });
  const [prefs, setPrefs] = useState({ room: "Standard", meal: "Regular", transport: "AC Bus", requests: "" });
  const [payMethod, setPayMethod] = useState("bKash");

  const selected = dates.find((d) => d.id === dateId);
  const unit = selected?.price || tour.price;
  const count = travelers.length;
  const subtotal = unit * count;
  const roomExtra = prefs.room === "Deluxe" ? 1500 * count : prefs.room === "Premium" ? 3000 * count : 0;
  const total = subtotal + roomExtra;
  const deposit = Math.round(total * 0.3);

  const valid = useMemo(() => {
    if (step === 0) return Boolean(dateId || customDate);
    if (step === 1) return contact.name.trim().length > 1 && contact.phone.trim().length > 5 && /\S+@\S+\.\S+/.test(contact.email) && travelers.every((t) => t.name.trim());
    if (step === 2) return emergency.name.trim().length > 1 && emergency.phone.trim().length > 5;
    return true;
  }, [step, dateId, customDate, contact, travelers, emergency]);

  const submit = async () => {
    setBusy(true);
    const res = await run(createBooking({
      tourId: tour.id,
      tourDateId: dateId || undefined,
      tourTitle: tour.title,
      date: selected?.date || customDate || undefined,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      emergencyName: emergency.name,
      emergencyPhone: emergency.phone,
      specialRequests: [`Room: ${prefs.room}`, `Meal: ${prefs.meal}`, `Transport: ${prefs.transport}`, prefs.requests].filter(Boolean).join(" · "),
      total,
      travelers,
    }));
    setBusy(false);
    if (!res.ok) {
      toast(res.error, "error", "Booking failed");
      return;
    }
    toast("Booking submitted successfully", "success");
    router.push(`/booking/confirmation/${res.bookingId}?method=${encodeURIComponent(payMethod)}`);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8">
      <div className="card p-5 sm:p-7">
        {/* stepper */}
        <ol className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto no-scrollbar" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className={`grid place-items-center h-7 w-7 rounded-full text-xs font-bold ${i < step ? "gradient-brand text-white" : i === step ? "bg-sky-600 text-white ring-4 ring-sky-500/20" : "bg-gray-100 dark:bg-white/10 text-muted"}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`text-xs font-semibold ${i === step ? "" : "text-muted"} hidden sm:block`}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-4 sm:w-8 h-px bg-line" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-1">Choose your departure</h2>
            <p className="text-sm text-muted mb-5">Live seat availability. Prices are per person.</p>
            {dates.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {dates.map((d) => (
                  <button key={d.id} onClick={() => setDateId(d.id)} className={`text-left p-4 rounded-2xl border transition ${dateId === d.id ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10 shadow-card" : "border-line hover:border-sky-300"}`}>
                    <span className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-sky-500" /> {formatDate(d.date)}</span>
                    <span className="block text-xs text-muted mt-1">{d.seatsLeft} seats left · {formatCurrency(d.price)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <label className="field">Preferred date<input type="date" className="input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} /></label>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-5">Traveler details</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <label className="field">Contact name<input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label>
              <label className="field">Phone<input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+880…" /></label>
              <label className="field">Email<input type="email" className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-sky-500" /> Travelers ({travelers.length})</h3>
              <button onClick={() => setTravelers([...travelers, { name: "", age: "", gender: "" }])} className="btn btn-soft btn-sm"><Plus className="h-4 w-4" /> Add</button>
            </div>
            <div className="space-y-3">
              {travelers.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_110px_auto] gap-2 items-end">
                  <label className="field">Name<input className="input" value={t.name} onChange={(e) => setTravelers(travelers.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></label>
                  <label className="field">Age<input className="input" value={t.age} onChange={(e) => setTravelers(travelers.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))} /></label>
                  <label className="field">Gender<select className="input" value={t.gender} onChange={(e) => setTravelers(travelers.map((x, j) => (j === i ? { ...x, gender: e.target.value } : x)))}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></label>
                  <button aria-label="Remove traveler" disabled={travelers.length === 1} onClick={() => setTravelers(travelers.filter((_, j) => j !== i))} className="h-[42px] w-10 grid place-items-center rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-1">Emergency contact</h2>
            <p className="text-sm text-muted mb-5">Someone we can reach during the trip if needed.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="field">Contact name<input className="input" value={emergency.name} onChange={(e) => setEmergency({ ...emergency, name: e.target.value })} /></label>
              <label className="field">Contact phone<input className="input" value={emergency.phone} onChange={(e) => setEmergency({ ...emergency, phone: e.target.value })} placeholder="+880…" /></label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-5">Travel preferences</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="field">Room type<select className="input" value={prefs.room} onChange={(e) => setPrefs({ ...prefs, room: e.target.value })}><option>Standard</option><option>Deluxe</option><option>Premium</option></select></label>
              <label className="field">Meal preference<select className="input" value={prefs.meal} onChange={(e) => setPrefs({ ...prefs, meal: e.target.value })}><option>Regular</option><option>Vegetarian</option><option>Halal only</option><option>No seafood</option></select></label>
              <label className="field">Transport<select className="input" value={prefs.transport} onChange={(e) => setPrefs({ ...prefs, transport: e.target.value })}><option>AC Bus</option><option>Microbus</option><option>Private car</option><option>Train</option></select></label>
            </div>
            <label className="field mt-4">Special requests<textarea className="input" rows={4} value={prefs.requests} onChange={(e) => setPrefs({ ...prefs, requests: e.target.value })} placeholder="Birthday surprise, accessibility needs, dietary notes…" /></label>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-5">Review your booking</h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-muted">Tour</dt><dd className="font-semibold">{tour.title}</dd></div>
              <div><dt className="text-muted">Date</dt><dd className="font-semibold">{selected ? formatDate(selected.date) : customDate || "Flexible"}</dd></div>
              <div><dt className="text-muted">Contact</dt><dd className="font-semibold">{contact.name} · {contact.phone}</dd></div>
              <div><dt className="text-muted">Email</dt><dd className="font-semibold">{contact.email}</dd></div>
              <div><dt className="text-muted">Travelers</dt><dd className="font-semibold">{travelers.map((t) => t.name).join(", ")}</dd></div>
              <div><dt className="text-muted">Emergency</dt><dd className="font-semibold">{emergency.name} · {emergency.phone}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Preferences</dt><dd className="font-semibold">{prefs.room} room · {prefs.meal} · {prefs.transport}{prefs.requests ? ` · ${prefs.requests}` : ""}</dd></div>
            </dl>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-1">Payment</h2>
            <p className="text-sm text-muted mb-5">Secure your seat with a 30% deposit or pay in full. Payments are processed server-side via your chosen gateway.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["bKash", "Nagad", "Card (SSLCommerz)", "Bank transfer"].map((m) => (
                <button key={m} onClick={() => setPayMethod(m)} className={`p-3 rounded-2xl border text-sm font-semibold transition ${payMethod === m ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10" : "border-line hover:border-sky-300"}`}>{m}</button>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-sm flex gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <p>Submitting creates a <b>booking request</b>. You&apos;ll receive a booking ID and QR code, and the payment step is completed from your confirmation page — gateway credentials are never exposed to the browser.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-line">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn btn-ghost disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!valid} className="btn btn-primary disabled:opacity-50">Continue <ChevronRight className="h-4 w-4" /></button>
          ) : (
            <button onClick={submit} disabled={busy} className="btn btn-primary">{busy ? "Submitting…" : "Confirm booking request"} <Check className="h-4 w-4" /></button>
          )}
        </div>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-24 h-fit space-y-4">
        <div className="card overflow-hidden">
          <img src={tour.image} alt={tour.title} className="h-36 w-full object-cover" />
          <div className="p-5">
            <h3 className="font-display font-bold">{tour.title}</h3>
            <p className="text-xs text-muted mt-1">{tour.duration} · departs {tour.departure}</p>
            <div className="divider my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{formatCurrency(unit)} × {count}</dt><dd className="font-semibold">{formatCurrency(subtotal)}</dd></div>
              {roomExtra > 0 && <div className="flex justify-between"><dt className="text-muted">{prefs.room} upgrade</dt><dd className="font-semibold">{formatCurrency(roomExtra)}</dd></div>}
              <div className="flex justify-between text-base pt-2 border-t border-line"><dt className="font-bold">Total</dt><dd className="font-extrabold">{formatCurrency(total)}</dd></div>
              <div className="flex justify-between text-xs"><dt className="text-muted flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Deposit (30%)</dt><dd className="font-semibold">{formatCurrency(deposit)}</dd></div>
            </dl>
          </div>
        </div>
        <p className="text-[0.7rem] text-muted px-1">Free cancellation up to 7 days before departure. See our cancellation policy.</p>
      </aside>
    </div>
  );
}
