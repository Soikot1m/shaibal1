import { NextResponse } from "next/server";
import { db } from "@/db";
import { tours, destinations, faqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// Simple in-memory rate limiting (per-instance). Use Redis/Upstash in production.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > 20;
}

function fmt(n: number) {
  return `৳${n.toLocaleString("en-IN")}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (limited(ip)) return NextResponse.json({ reply: "You're sending messages quickly — please wait a moment." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message || "").slice(0, 600).trim();
  if (!message) return NextResponse.json({ reply: "Ask me about destinations, tours, budgets or packing." });

  const [allTours, allDests, allFaqs] = await Promise.all([
    db.select().from(tours).where(eq(tours.status, "published")),
    db.select().from(destinations),
    db.select().from(faqs),
  ]);

  const context = allTours
    .map((t) => `${t.title} (${t.category}, ${t.durationDays}D/${t.durationNights}N, from ${fmt(t.discountPrice || t.price)}, departs ${t.departureCity}, difficulty ${t.difficulty}) /tours/${t.slug}`)
    .join("\n");

  // Optional LLM (server-side only; key never reaches the browser)
  const key = process.env.AI_API_KEY;
  if (key) {
    try {
      const res = await fetch(process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: `You are Shaibal AI, the travel assistant for Shaibal Tours & Travels (Bogura, Bangladesh). Be concise and friendly. Only recommend tours from this catalog:\n${context}\nFAQ:\n${allFaqs.map((f) => `${f.question} — ${f.answer}`).join("\n")}` },
            { role: "user", content: message },
          ],
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return NextResponse.json({ reply, source: "llm" });
    } catch {
      /* fall through to rule-based */
    }
  }

  // Rule-based assistant using live database data
  const q = message.toLowerCase();
  const matchTours = allTours.filter((t) => (t.title + " " + t.category + " " + (t.description || "")).toLowerCase().split(/\W+/).some((w) => w.length > 3 && q.includes(w)));
  const matchDest = allDests.find((d) => q.includes(d.name.toLowerCase().split(",")[0]) || q.includes(d.slug.replace("-", " ")));
  const budgetMatch = q.match(/(\d[\d,]{3,})/);

  let reply = "";
  if (/pack|checklist|bring|carry/.test(q)) {
    reply = "Packing essentials: valid NID/passport, tickets & booking QR, cash + bKash balance, power bank, light layers & a jacket for the hills, comfortable shoes, personal medicine, sunscreen, water bottle, and copies of emergency contacts. For beach trips add swimwear & a hat; for treks add a headlamp and rain cover.";
  } else if (/cancel|refund/.test(q)) {
    reply = allFaqs.find((f) => /cancel/i.test(f.question))?.answer || "Free cancellation up to 7 days before departure; 50% refund within 72 hours.";
  } else if (/pay|bkash|nagad|price|cost|how much|budget|cheap|under|below|within|taka|৳/.test(q) && budgetMatch) {
    const b = Number(budgetMatch[1].replace(/,/g, ""));
    const fits = allTours.filter((t) => (t.discountPrice || t.price) > 0 && (t.discountPrice || t.price) <= b).sort((a, c) => (c.rating || 0) - (a.rating || 0)).slice(0, 4);
    reply = fits.length
      ? `Within ${fmt(b)} per person you could do: ${fits.map((t) => `${t.title} (${fmt(t.discountPrice || t.price)}, ${t.durationDays}D)`).join("; ")}. Want me to outline an itinerary for one of these?`
      : `Our packages start from ${fmt(Math.min(...allTours.filter((t) => t.price > 0).map((t) => t.discountPrice || t.price)))} per person. Tell me your budget and I'll match tours.`;
  } else if (/pay|bkash|nagad|card/.test(q)) {
    reply = "You can pay a 30% deposit or the full amount via bKash, Nagad, card (SSLCommerz) or bank transfer from your booking confirmation page. Payments are processed securely on our server.";
  } else if (matchDest) {
    const dt = allTours.filter((t) => t.destinationId === matchDest.id);
    reply = `${matchDest.name} — ${matchDest.headline || matchDest.type}. Best time: ${matchDest.bestTime}. Budget from ${fmt(matchDest.budget || 0)}. Top activities: ${(matchDest.activities || []).slice(0, 4).join(", ")}.` + (dt.length ? ` Matching tours: ${dt.map((t) => `${t.title} (${t.durationDays}D, ${fmt(t.discountPrice || t.price)})`).join("; ")}.` : "");
  } else if (matchTours.length) {
    reply = `Here's what I found: ${matchTours.slice(0, 3).map((t) => `${t.title} — ${t.durationDays}D/${t.durationNights}N, ${t.difficulty}, from ${fmt(t.discountPrice || t.price)}, departs ${t.departureCity}`).join(" · ")}. Open the tour page to see the full itinerary and dates.`;
  } else if (/honeymoon|couple|romantic/.test(q)) {
    reply = "For couples we recommend Cox's Bazar Escape (sunsets & beach dinners), Sajek Valley (cloud-sea sunrises) or Thailand Bangkok Escape for an international honeymoon. Want a private custom itinerary? Use Build Your Trip on the contact page.";
  } else if (/family|kids|children/.test(q)) {
    reply = "Family favourites: Cox's Bazar Escape (easy, beach), Sylhet Nature Tour (tea gardens, gentle walks) and Rangamati Lakeside Tour (short & scenic). All rated Easy difficulty.";
  } else if (/adventure|trek|hike|hill/.test(q)) {
    reply = "For adventure: Bandarban Adventure (Nilgiri, Boga lake, treks), Sajek Valley Experience and the Sundarbans Expedition (river safari). Nepal Kathmandu Adventure is our top international pick.";
  } else {
    const top = [...allTours].sort((a, b) => (b.travelerCount || 0) - (a.travelerCount || 0)).slice(0, 3);
    reply = `I can help with destinations, tours, budgets, itineraries and packing. Our most popular tours right now: ${top.map((t) => `${t.title} (from ${fmt(t.discountPrice || t.price)})`).join(", ")}. Try asking “3-day trip under 10,000” or “best time for Sajek”.`;
  }
  return NextResponse.json({ reply, source: "rules" });
}
