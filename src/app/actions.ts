"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { bookings, payments, users, tours, tourDates, reviews, contactSubmissions, newsletterSubscribers, customTripRequests, supportTickets, notifications, auditLogs, type ProgressStep } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, destroySession, getSessionUser } from "@/lib/auth";
import {
  loginSchema, registerSchema, bookingSubmitSchema, reviewSchema,
  contactSchema, newsletterSchema, customTripSchema, ticketSchema,
} from "@/lib/validation";
import { uid } from "@/lib/utils";

function error(msg: string) {
  return { ok: false as const, error: msg };
}

function zmsg(err: { issues?: { message: string }[] }) {
  return err.issues?.[0]?.message ?? "Invalid input";
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  const { name, email, password } = parsed.data;
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return error("An account with this email already exists.");
  const id = randomUUID();
  await db.insert(users).values({ id, name, email, phone: parsed.data.phone || null, passwordHash: hashPassword(password), role: "customer" });
  await createSession(id);
  revalidatePath("/");
  return { ok: true as const, isAdmin: false, name };
}

export async function login(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  const row = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = row[0];
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return error("Invalid email or password.");
  }
  await createSession(user.id);
  const isAdmin = ["manager", "admin", "super_admin"].includes(user.role);
  revalidatePath("/");
  return { ok: true as const, isAdmin, name: user.name };
}

export async function logout() {
  await destroySession();
  revalidatePath("/");
}

export async function submitContact(input: { name: string; email?: string; phone?: string; subject?: string; message: string }) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  await db.insert(contactSubmissions).values({ id: uid(), ...parsed.data, email: parsed.data.email || null, phone: parsed.data.phone || null, subject: parsed.data.subject || null });
  return { ok: true as const, message: "Thanks for reaching out. We'll get back to you soon." };
}

export async function submitNewsletter(input: { email: string }) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return error("Enter a valid email.");
  await db.insert(newsletterSubscribers).values({ id: uid(), email: parsed.data.email }).onConflictDoNothing();
  return { ok: true as const, message: "You're on the list." };
}

export async function submitReview(input: { author: string; rating: number; content: string; title?: string; tourId?: string; travelDate?: string }) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  const user = await getSessionUser();
  await db.insert(reviews).values({
    id: uid(), author: parsed.data.author, rating: parsed.data.rating, content: parsed.data.content,
    title: parsed.data.title || null, tourId: parsed.data.tourId || null,
    userId: user?.id || null, travelDate: parsed.data.travelDate || null,
    photos: [], status: "pending",
  });
  revalidatePath("/");
  return { ok: true as const, message: "Review submitted. Thank you!" };
}

export async function submitCustomTrip(input: { name: string; destination: string; phone?: string; email?: string; travelers?: number; budget?: number; requirements?: string; startDate?: string; endDate?: string }) {
  const parsed = customTripSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  await db.insert(customTripRequests).values({
    id: uid(), name: parsed.data.name, destination: parsed.data.destination,
    phone: parsed.data.phone || null, email: parsed.data.email || null,
    travelers: parsed.data.travelers ?? 1, budget: parsed.data.budget ?? 0,
    requirements: parsed.data.requirements || null,
    startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    status: "new",
  });
  return { ok: true as const, message: "Custom tour request received! Our team will reach out to craft your itinerary." };
}

export async function submitSupportTicket(input: { name: string; subject: string; message: string; email?: string; category?: string; priority?: string }) {
  const parsed = ticketSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  const user = await getSessionUser();
  await db.insert(supportTickets).values({
    id: uid(), name: parsed.data.name, subject: parsed.data.subject, message: parsed.data.message,
    email: parsed.data.email || null, category: parsed.data.category || "General",
    priority: parsed.data.priority || "normal", userId: user?.id || null, status: "open",
  });
  return { ok: true as const, message: "Ticket submitted. We'll respond shortly." };
}

export async function createBooking(input: {
  tourId: string; tourDateId?: string; tourTitle?: string; date?: string; contactName: string;
  contactPhone: string; contactEmail: string; emergencyName?: string; emergencyPhone?: string;
  specialRequests?: string; total?: number; travelers?: { name: string; age?: string; gender?: string; nid?: string }[];
}) {
  const parsed = bookingSubmitSchema.safeParse(input);
  if (!parsed.success) return error(zmsg(parsed.error));
  const d = parsed.data;
  const tour = await db.select().from(tours).where(eq(tours.id, d.tourId!)).limit(1);
  const basePrice = tour[0]?.discountPrice && tour[0].discountPrice > 0 ? tour[0].discountPrice : tour[0]?.price ?? 0;
  const travelers = d.travelers?.length ? d.travelers.length : 1;
  const total = d.total && d.total > 0 ? d.total : basePrice * travelers;
  const user = await getSessionUser();
  const all = await db.select().from(bookings);
  const next = all.length + 1;
  const code = `STL-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
  const bookingId = uid("bk");
  const steps: ProgressStep[] = [
    { id: "s1", label: "Booking Submitted", status: "completed", detail: `Booking ${code}` },
    { id: "s2", label: "Payment", status: "upcoming", detail: d.total && d.total > 0 ? "Awaiting payment" : "No payment due" },
    { id: "s3", label: "Confirmation", status: "upcoming" },
    { id: "s4", label: "Departure", status: "upcoming" },
    { id: "s5", label: "Trip Completed", status: "upcoming" },
  ];
  await db.insert(bookings).values({
    id: bookingId, bookingCode: code, tourId: tour[0]?.id, tourDateId: d.tourDateId || null,
    tourTitle: d.tourTitle || tour[0]?.title || "Tour", userId: user?.id || null,
    contactName: d.contactName, contactPhone: d.contactPhone, contactEmail: d.contactEmail,
    emergencyName: d.emergencyName || null, emergencyPhone: d.emergencyPhone || null,
    date: d.date ? new Date(d.date) : null, travelers: d.travelers || [],
    preferences: {}, specialRequests: d.specialRequests || null, total, paidAmount: 0,
    status: "pending", progress: 5, progressJson: steps, createdBy: "public",
  });
  if (d.tourDateId) {
    try {
      const td = await db.select().from(tourDates).where(eq(tourDates.id, d.tourDateId)).limit(1);
      const seats = td[0]?.seatsBooked || 0;
      await db.update(tourDates).set({ seatsBooked: seats + 1 }).where(eq(tourDates.id, d.tourDateId));
    } catch { /* ignore */ }
  }
  await db.insert(notifications).values({ id: uid(), userId: user?.id || null, title: "Booking received", message: `Your booking ${code} for ${d.tourTitle || tour[0]?.title} was submitted.`, type: "booking" });
  revalidatePath("/account");
  return { ok: true as const, bookingId, code, message: "Booking submitted successfully" };
}

export async function toggleFavorite(entityType: "tour" | "destination" | "blog", entityId: string) {
  const user = await getSessionUser();
  if (!user) return error("Please log in to save items.");
  const { favorites } = await import("@/db/schema");
  const { and } = await import("drizzle-orm");
  const existing = await db.select().from(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.entityType, entityType), eq(favorites.entityId, entityId))).limit(1);
  if (existing[0]) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    revalidatePath("/account");
    return { ok: true as const, saved: false, message: "Removed from saved" };
  }
  await db.insert(favorites).values({ id: uid("fav"), userId: user.id, entityType, entityId });
  revalidatePath("/account");
  return { ok: true as const, saved: true, message: "Tour saved" };
}

export async function updateProfile(input: { name: string; phone?: string }) {
  const user = await getSessionUser();
  if (!user) return error("Not signed in.");
  const name = String(input.name || "").trim();
  if (name.length < 2) return error("Please enter your name.");
  await db.update(users).set({ name, phone: input.phone?.trim() || null }).where(eq(users.id, user.id));
  revalidatePath("/account");
  return { ok: true as const, message: "Profile updated" };
}

export async function markNotificationsRead() {
  const user = await getSessionUser();
  if (!user) return error("Not signed in.");
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
  revalidatePath("/account");
  return { ok: true as const, message: "All caught up" };
}

export async function recordPayment(input: { bookingId: string; amount: number; method?: string; gateway?: string; transactionId?: string }) {
  if (!input.bookingId || !(input.amount > 0)) return error("Invalid payment.");
  const book = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
  if (!book[0]) return error("Booking not found.");
  const newPaid = (book[0].paidAmount || 0) + input.amount;
  const status = newPaid >= (book[0].total || 0) ? "paid" : "partially_paid";
  await db.insert(payments).values({ id: uid("pay"), bookingId: input.bookingId, amount: input.amount, method: input.method || "online", gateway: input.gateway || "bKash", transactionId: input.transactionId || uid("tx"), status: "confirmed", paidBy: book[0].contactName || null });
  await db.update(bookings).set({ paidAmount: newPaid, status }).where(eq(bookings.id, input.bookingId));
  await db.insert(auditLogs).values({ id: uid(), actor: "customer", action: "record_payment", entity: "booking", entityId: input.bookingId, metadata: { amount: input.amount, newPaid, status } });
  revalidatePath("/account");
  return { ok: true as const, message: "Payment confirmed" };
}
