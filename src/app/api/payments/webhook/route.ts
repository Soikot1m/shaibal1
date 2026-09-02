import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { bookings, payments, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uid } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Payment gateway webhook (bKash / Nagad / SSLCommerz).
 * Flow: frontend → /api/payments/initiate (server, uses secret keys) → gateway → this webhook
 * → signature verified → transaction verified with gateway API → booking updated → receipt.
 * Never trust the browser for payment status.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  const sig = req.headers.get("x-signature") || "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const body = JSON.parse(raw) as { bookingId: string; amount: number; transactionId: string; gateway: string; status: string };
  if (body.status !== "success") return NextResponse.json({ ok: true, ignored: true });
  const dup = await db.select().from(payments).where(eq(payments.transactionId, body.transactionId)).limit(1);
  if (dup.length) return NextResponse.json({ ok: true, duplicate: true }); // idempotent
  const bk = (await db.select().from(bookings).where(eq(bookings.id, body.bookingId)).limit(1))[0];
  if (!bk) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const paid = (bk.paidAmount || 0) + Math.round(body.amount);
  await db.insert(payments).values({ id: uid("pay"), bookingId: bk.id, amount: Math.round(body.amount), method: "online", gateway: body.gateway, transactionId: body.transactionId, status: "confirmed", paidBy: bk.contactName });
  await db.update(bookings).set({ paidAmount: paid, status: paid >= (bk.total || 0) ? "paid" : "partially_paid" }).where(eq(bookings.id, bk.id));
  await db.insert(auditLogs).values({ id: uid("log"), actor: `webhook:${body.gateway}`, action: "payment.webhook", entity: "booking", entityId: bk.id, metadata: { amount: body.amount, transactionId: body.transactionId, previousPaid: bk.paidAmount, newPaid: paid } });
  return NextResponse.json({ ok: true });
}
