import "server-only";
import { db } from "@/db";
import {
  tours, tourDates, destinations, reviews, blogPosts, faqs, galleryItems,
  bookings, payments, trips, participants, tripExpenses,
  type ProgressStep,
} from "@/db/schema";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";

export async function getPublishedTours(opts?: { featured?: boolean; limit?: number }) {
  const q = db.select().from(tours);
  const clauses = [eq(tours.status, "published")];
  if (opts?.featured) clauses.push(eq(tours.featured, true));
  const rows = await q.where(and(...clauses)).limit(opts?.limit ?? 100);
  return rows;
}

export async function getFeaturedTours() {
  return getPublishedTours({ featured: true });
}

export async function getTourBySlug(slug: string) {
  const rows = await db.select().from(tours).where(eq(tours.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getTourDates(tourId: string) {
  return db.select().from(tourDates).where(eq(tourDates.tourId, tourId)).orderBy(asc(tourDates.date));
}

export async function getDestinations(opts?: { featured?: boolean; limit?: number }) {
  const clauses = [];
  if (opts?.featured) clauses.push(eq(destinations.featured, true));
  const rows = await db.select().from(destinations).limit(opts?.limit ?? 100);
  return rows;
}

export async function getDestinationBySlug(slug: string) {
  const rows = await db.select().from(destinations).where(eq(destinations.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getToursForDestination(destId: string) {
  return db.select().from(tours).where(and(eq(tours.destinationId, destId), eq(tours.status, "published")));
}

export async function getFeaturedReviews(limit = 6) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "featured"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getBlogPosts(limit = 20) {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit);
}

export async function getBlogPostBySlug(slug: string) {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.category));
}

export async function getGallery() {
  return db.select().from(galleryItems).orderBy(desc(galleryItems.createdAt));
}

export async function getRelatedTours(tourId: string, excludeId: string, limit = 3) {
  return db
    .select()
    .from(tours)
    .where(eq(tours.status, "published"))
    .limit(limit);
}

// ---- bookings with a couple of related tables (admin/account) ----
export async function getBookingsByUser(userId: string) {
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function getPaymentsByBooking(bookingId: string) {
  return db.select().from(payments).where(eq(payments.bookingId, bookingId)).orderBy(asc(payments.createdAt));
}

export async function getTripByBooking(bookingId: string) {
  const rows = await db.select().from(trips).where(eq(trips.tourId, bookingId)).limit(1);
  return rows[0] ?? null;
}

// ---- Admin: overview numbers ----
export async function adminStats() {
  const [b, p, t, pt, tr] = await Promise.all([
    db.select().from(bookings),
    db.select().from(payments).where(eq(payments.status, "confirmed")),
    db.select().from(trips),
    db.select().from(participants),
    db.select().from(tripExpenses),
  ]);
  const revenue = p.reduce((a, x) => a + (x.amount || 0), 0);
  const totalExpense = tr.reduce((a, x) => a + (x.amount || 0), 0);
  const active = b.filter((x) => ["pending", "confirmed", "paid", "partially_paid"].includes(x.status));
  const pendingPayments = b.reduce((a, x) => a + (x.total || 0) - (x.paidAmount || 0), 0);
  return {
    totalBookings: b.length,
    revenue,
    totalExpense,
    profit: revenue - totalExpense,
    pendingPayments,
    upcomingTrips: active.length,
    activeTravelers: pt.length,
    completedTours: b.filter((x) => x.status === "completed").length,
    trips: t.length,
    bookings: b,
    payments: p,
  };
}
