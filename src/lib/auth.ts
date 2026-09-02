import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "crypto";
import { db } from "@/db";
import { sessions, users, type DB } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const SESSION_COOKIE = "sb_session";
const SESSION_DAYS = 7;

export type SessionUser = DB["users"]["$inferSelect"] & { isAdmin: boolean };

function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(pw: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [, salt, hash] = parts;
  const test = scryptSync(pw, salt, 64);
  const ref = Buffer.from(hash, "hex");
  return test.length === ref.length && timingSafeEqual(test, ref);
}

const ADMIN_ROLES = ["manager", "admin", "super_admin"];

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db
    .insert(sessions)
    .values({ id: randomUUID(), userId, token, expiresAt })
    .onConflictDoNothing();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_DAYS * 86400,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch {
      /* ignore */
    }
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
    const row = rows[0];
    if (!row) return null;
    const u = row.user;
    return { ...u, isAdmin: ADMIN_ROLES.includes(u.role) };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user?.isAdmin) return null;
  return user;
}

export { hashPassword, verifyPassword, ADMIN_ROLES };
