import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

// GET /api/bookings?code=STL-2026-0001 — returns the caller's own booking (or public masked view)
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
  const b = (await db.select().from(bookings).where(eq(bookings.bookingCode, code.toUpperCase())).limit(1))[0];
  if (!b) return NextResponse.json({ error: "not found" }, { status: 404 });
  const user = await getSessionUser();
  const own = user && (user.isAdmin || user.id === b.userId);
  return NextResponse.json(own ? b : { bookingCode: b.bookingCode, tourTitle: b.tourTitle, date: b.date, status: b.status, progress: b.progress });
}
