"use client";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Send, Share2, Save, CheckSquare, Square, MapPin, Wallet, ShieldAlert, Bot } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { ItineraryDay } from "@/db/schema";

type TourLite = { slug: string; title: string; destination: string; price: number; days: number; itinerary: ItineraryDay[]; category: string; image: string };
type Plan = { destination: string; start: string; end: string; people: number; budget: number; interests: string[]; transport: string; hotel: string; notes: string };

const INTERESTS = ["Nature", "Beach", "Adventure", "Culture", "Food", "Photography", "Relaxation", "Shopping"];
const CHECKLIST = ["Passport / NID", "Tickets & booking QR", "Cash + mobile banking", "Power bank & chargers", "Weather-appropriate clothing", "Personal medicine", "Emergency contacts saved", "Hotel confirmation", "Sunscreen & hat", "Reusable water bottle"];

function decodePlan(s: string | null): Plan | null {
  try {
    return s ? (JSON.parse(atob(decodeURIComponent(s))) as Plan) : null;
  } catch {
    return null;
  }
}

export function Planner({ tours, initialDestination = "" }: { tours: TourLite[]; initialDestination?: string }) {
  const [plan, setPlan] = useState<Plan>({ destination: initialDestination, start: "", end: "", people: 2, budget: 10000, interests: ["Nature"], transport: "AC Bus", hotel: "Standard", notes: "" });
  const [checked, setChecked] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const p = decodePlan(new URLSearchParams(window.location.search).get("plan"));
    if (p) {
      setPlan(p);
      setGenerated(true);
    } else {
      try {
        const saved = localStorage.getItem("sb_plan");
        if (saved) setPlan(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    try {
      setChecked(JSON.parse(localStorage.getItem("sb_checklist") || "[]"));
    } catch { /* ignore */ }
  }, []);

  const days = useMemo(() => {
    if (plan.start && plan.end) return Math.min(14, Math.max(1, Math.round((new Date(plan.end).getTime() - new Date(plan.start).getTime()) / 86400000) + 1));
    return 3;
  }, [plan.start, plan.end]);

  const match = useMemo(() => {
    const q = plan.destination.toLowerCase();
    return tours.find((t) => q && (t.destination.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || q.includes(t.destination.toLowerCase().split(",")[0])));
  }, [plan.destination, tours]);

  const hotelRate = plan.hotel === "Premium" ? 6000 : plan.hotel === "Deluxe" ? 3500 : 1800;
  const transportRate = plan.transport === "Private car" ? 4500 : plan.transport === "Flight" ? 9000 : plan.transport === "Microbus" ? 2500 : 1500;
  const foodRate = 900;
  const activityRate = plan.interests.includes("Adventure") ? 1200 : 700;

  const itinerary = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const src = match?.itinerary?.[i] || match?.itinerary?.[Math.min(i, (match?.itinerary?.length || 1) - 1)];
      const isFirst = i === 0;
      const isLast = i === days - 1;
      const title = isFirst ? `Departure → ${plan.destination || "destination"}` : isLast ? "Return journey" : src?.title || `Explore ${plan.destination || "the area"}`;
      const activity = src?.activity || (isFirst ? `Travel by ${plan.transport}, check-in and an easy evening walk.` : isLast ? "Breakfast, last photos and the scenic ride home." : `${plan.interests.slice(0, 2).join(" & ") || "Sightseeing"} day with local guide.`);
      const hotel = isLast ? "—" : `${plan.hotel} ${src?.overnight && src.overnight !== "—" ? `(${src.overnight})` : "hotel"}`;
      const cost = (isLast ? 0 : hotelRate) + (isFirst || isLast ? transportRate : Math.round(transportRate / 3)) + foodRate + (isFirst || isLast ? 0 : activityRate);
      return { day: i + 1, title, activity, transport: isFirst || isLast ? plan.transport : "Local transport", hotel, meals: src?.meals || (isFirst ? "Dinner" : isLast ? "Breakfast" : "Breakfast, Dinner"), cost: cost * plan.people };
    });
  }, [days, match, plan, hotelRate, transportRate, activityRate]);

  const total = itinerary.reduce((a, d) => a + d.cost, 0);
  const perPerson = Math.round(total / plan.people);
  const budgetTotal = plan.budget * plan.people;
  const breakdown = [
    { k: "Hotel", v: hotelRate * (days - 1) * plan.people },
    { k: "Transport", v: (transportRate * 2 + Math.round(transportRate / 3) * Math.max(0, days - 2)) * plan.people },
    { k: "Food", v: foodRate * days * plan.people },
    { k: "Activities", v: activityRate * Math.max(0, days - 2) * plan.people },
  ];

  const save = () => {
    localStorage.setItem("sb_plan", JSON.stringify(plan));
    toast("Trip plan updated", "success");
  };
  const share = async () => {
    const url = `${window.location.origin}/planner?plan=${encodeURIComponent(btoa(JSON.stringify(plan)))}`;
    try {
      if (navigator.share) await navigator.share({ title: `My ${plan.destination} trip plan`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Shareable link copied", "success");
      }
    } catch { /* cancelled */ }
  };
  const toggle = (c: string) => {
    const next = checked.includes(c) ? checked.filter((x) => x !== c) : [...checked, c];
    setChecked(next);
    localStorage.setItem("sb_checklist", JSON.stringify(next));
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <aside className="card p-6 h-fit lg:sticky lg:top-24">
        <h2 className="font-display font-bold text-xl mb-4">Trip details</h2>
        <div className="space-y-3">
          <label className="field">Destination<input list="dests" className="input" value={plan.destination} onChange={(e) => setPlan({ ...plan, destination: e.target.value })} placeholder="Bandarban, Cox's Bazar…" />
            <datalist id="dests">{Array.from(new Set(tours.map((t) => t.destination))).map((d) => <option key={d} value={d} />)}</datalist>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="field">Start<input type="date" className="input" value={plan.start} onChange={(e) => setPlan({ ...plan, start: e.target.value })} /></label>
            <label className="field">End<input type="date" className="input" value={plan.end} onChange={(e) => setPlan({ ...plan, end: e.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="field">People<input type="number" min={1} max={60} className="input" value={plan.people} onChange={(e) => setPlan({ ...plan, people: Math.max(1, Number(e.target.value)) })} /></label>
            <label className="field">Budget / person<input type="number" min={0} step={500} className="input" value={plan.budget} onChange={(e) => setPlan({ ...plan, budget: Number(e.target.value) })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="field">Transport<select className="input" value={plan.transport} onChange={(e) => setPlan({ ...plan, transport: e.target.value })}><option>AC Bus</option><option>Microbus</option><option>Private car</option><option>Train</option><option>Flight</option></select></label>
            <label className="field">Hotel<select className="input" value={plan.hotel} onChange={(e) => setPlan({ ...plan, hotel: e.target.value })}><option>Standard</option><option>Deluxe</option><option>Premium</option></select></label>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button key={i} onClick={() => setPlan({ ...plan, interests: plan.interests.includes(i) ? plan.interests.filter((x) => x !== i) : [...plan.interests, i] })} className={`chip ${plan.interests.includes(i) ? "chip-active" : ""}`}>{i}</button>)}</div>
          </div>
          <label className="field">Notes<textarea rows={2} className="input" value={plan.notes} onChange={(e) => setPlan({ ...plan, notes: e.target.value })} placeholder="Anniversary dinner on day 2…" /></label>
          <button onClick={() => { setGenerated(true); save(); }} className="btn btn-primary w-full"><Sparkles className="h-4 w-4" /> Generate plan</button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={save} className="btn btn-ghost btn-sm"><Save className="h-4 w-4" /> Save</button>
            <button onClick={share} className="btn btn-ghost btn-sm"><Share2 className="h-4 w-4" /> Share</button>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        {!generated ? (
          <div className="card p-10 text-center">
            <Sparkles className="h-8 w-8 text-sky-500 mx-auto" />
            <p className="font-display font-bold text-xl mt-3">Your itinerary will appear here</p>
            <p className="text-sm text-muted mt-1">Fill the details and hit Generate. We pre-fill activities from our real tour itineraries when a destination matches.</p>
          </div>
        ) : (
          <>
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <p className="chip mb-2"><MapPin className="h-3 w-3" /> {plan.destination || "Destination"}</p>
                  <h2 className="font-display font-extrabold text-2xl">{days}-day itinerary for {plan.people} traveler{plan.people > 1 ? "s" : ""}</h2>
                  {match && <p className="text-xs text-muted mt-1">Based on <a href={`/tours/${match.slug}`} className="underline">{match.title}</a></p>}
                </div>
                <div className="text-right"><p className="text-xs text-muted">Estimated total</p><p className="font-display font-extrabold text-2xl">{formatCurrency(total)}</p><p className={`text-xs font-semibold ${perPerson <= plan.budget ? "text-emerald-600" : "text-amber-600"}`}>{formatCurrency(perPerson)} / person · {perPerson <= plan.budget ? "within budget" : `${formatCurrency(perPerson - plan.budget)} over budget`}</p></div>
              </div>
              <ol className="relative border-l-2 border-sky-200 dark:border-sky-800 ml-3 space-y-6">
                {itinerary.map((d) => (
                  <li key={d.day} className="pl-7 relative">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full gradient-brand ring-4 ring-white dark:ring-navy-900" />
                    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold"><span className="chip !text-xs mr-2">Day {d.day}</span>{d.title}</h3><span className="text-sm font-semibold">{formatCurrency(d.cost)}</span></div>
                    <p className="text-sm text-muted mt-1">{d.activity}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted"><span>🚌 {d.transport}</span><span>🏨 {d.hotel}</span><span>🍽 {d.meals}</span></div>
                  </li>
                ))}
              </ol>
              {plan.notes && <p className="mt-5 text-sm p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10">📝 {plan.notes}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display font-bold flex items-center gap-2 mb-4"><Wallet className="h-5 w-5 text-sky-500" /> Budget summary</h3>
                {breakdown.map((b) => (
                  <div key={b.k} className="mb-3"><div className="flex justify-between text-sm"><span>{b.k}</span><span className="font-semibold">{formatCurrency(b.v)}</span></div><div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 mt-1 overflow-hidden"><div className="h-full gradient-brand" style={{ width: `${Math.min(100, Math.round((b.v / Math.max(1, total)) * 100))}%` }} /></div></div>
                ))}
                <div className="flex justify-between text-sm pt-3 border-t border-line"><span className="text-muted">Your budget ({plan.people} × {formatCurrency(plan.budget)})</span><span className="font-bold">{formatCurrency(budgetTotal)}</span></div>
              </div>
              <div className="card p-6">
                <h3 className="font-display font-bold flex items-center gap-2 mb-4"><CheckSquare className="h-5 w-5 text-sky-500" /> Packing checklist <span className="ml-auto text-xs text-muted">{checked.length}/{CHECKLIST.length}</span></h3>
                <ul className="space-y-2">{CHECKLIST.map((c) => <li key={c}><button onClick={() => toggle(c)} className="flex items-center gap-2 text-sm text-left w-full">{checked.includes(c) ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4 text-muted" />}<span className={checked.includes(c) ? "line-through text-muted" : ""}>{c}</span></button></li>)}</ul>
              </div>
            </div>

            <div className="card p-6 border-amber-200 dark:border-amber-500/30">
              <h3 className="font-display font-bold flex items-center gap-2 mb-3"><ShieldAlert className="h-5 w-5 text-amber-500" /> Emergency information</h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5"><p className="text-xs text-muted">National emergency</p><p className="font-bold">999</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5"><p className="text-xs text-muted">Tour manager</p><p className="font-bold">[Phone Number]</p></div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5"><p className="text-xs text-muted">Office</p><p className="font-bold">Shaibal Tours, Bogura</p></div>
              </div>
            </div>
          </>
        )}
        <Assistant />
      </div>
    </div>
  );
}

export function Assistant() {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([{ role: "ai", text: "Hi! I'm Shaibal AI. Ask me for tour ideas, budgets, best travel times or a packing list." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async (text?: string) => {
    const m = (text || input).trim();
    if (!m) return;
    setInput("");
    setMsgs((p) => [...p, { role: "user", text: m }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: m }) });
      const data = await res.json();
      setMsgs((p) => [...p, { role: "ai", text: data.reply || "Sorry, I couldn't answer that." }]);
    } catch {
      setMsgs((p) => [...p, { role: "ai", text: "Network issue — please try again." }]);
    }
    setBusy(false);
  };
  return (
    <section id="assistant" className="card p-6">
      <h3 className="font-display font-bold flex items-center gap-2 mb-1"><Bot className="h-5 w-5 text-sky-500" /> Ask Shaibal AI</h3>
      <p className="text-xs text-muted mb-4">Answers use our live tour catalog. Connect <code>AI_API_KEY</code> for full conversational AI.</p>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {msgs.map((m, i) => <div key={i} className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl ${m.role === "ai" ? "bg-sky-50 dark:bg-sky-500/10" : "gradient-brand text-white ml-auto"}`}>{m.text}</div>)}
        {busy && <div className="text-xs text-muted animate-pulse">Thinking…</div>}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">{["3-day trip under 10,000", "Best time for Sajek", "Packing list for Bandarban", "Honeymoon ideas"].map((s) => <button key={s} onClick={() => send(s)} className="chip">{s}</button>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 mt-3">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your trip…" aria-label="Message" />
        <button className="btn btn-primary" aria-label="Send" disabled={busy}><Send className="h-4 w-4" /></button>
      </form>
    </section>
  );
}
