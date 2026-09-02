import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, destroySession, hashPassword, verifyPassword, ADMIN_ROLES } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";

export const runtime = "nodejs";

/** JSON authentication endpoint — also used as a fallback when Server Actions are blocked by a proxy. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { mode?: string; name?: string; email?: string; phone?: string; password?: string };

  if (body.mode === "logout") {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  if (body.mode === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    const exists = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (exists.length) return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
    const id = randomUUID();
    await db.insert(users).values({ id, name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null, passwordHash: hashPassword(parsed.data.password), role: "customer" });
    await createSession(id);
    return NextResponse.json({ ok: true, isAdmin: false, name: parsed.data.name });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const user = (await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1))[0];
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true, isAdmin: ADMIN_ROLES.includes(user.role), name: user.name });
}
