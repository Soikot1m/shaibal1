"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  bookings, payments, tours, tourDates, tripExpenses, trips, participants, reviews, settings,
  notifications, users, auditLogs, supportTickets, customTripRequests, destinations, hotels, transport,
  tripStages, tripProgressLogs, bookingStatusHistory, type ProgressStep,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { tourSchema, expenseSchema } from "@/lib/validation";
import { uid, slugify } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content";

type Res = { ok: true; message: string } | { ok: false; error: string };
const fail = (error: string): Res => ({ ok: false, error });
const okay = (message: string): Res => ({ ok: true, message });

async function audit(actor: string, action: string, entity: string, entityId: string, metadata?: unknown) {
  await db.insert(auditLogs).values({ id: uid("log"), actor, action, entity, entityId, metadata: metadata as object });
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/tours");
}

export async function setBookingStatus(id: string, status: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const allowed = ["pending", "confirmed", "paid", "partially_paid", "cancelled", "completed"] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) return fail("Invalid status");
  const b = (await db.select().from(bookings).where(eq(bookings.id, id)).limit(1))[0];
  if (!b) return fail("Booking not found");
  const patch: Partial<typeof bookings.$inferInsert> = { status: status as (typeof allowed)[number] };
  if (status === "completed") patch.progress = 100;
  if (status === "confirmed" && (b.progress || 0) < 25) patch.progress = 25;
  await db.update(bookings).set(patch).where(eq(bookings.id, id));
  await db.insert(bookingStatusHistory).values({
    id: uid("hst"), bookingId: id, fromStatus: b.status, toStatus: status,
    actor: admin.email, reason: "Updated from admin console",
  });
  await db.insert(notifications).values({ id: uid("n"), userId: b.userId, title: `Booking ${status.replace("_", " ")}`, message: `${b.tourTitle} (${b.bookingCode}) is now ${status.replace("_", " ")}.`, type: "booking" });
  await audit(admin.email, "booking.status", "booking", id, { from: b.status, to: status });
  refresh();
  return okay(`Booking marked ${status.replace("_", " ")}`);
}

export async function adminRecordPayment(input: { bookingId: string; amount: number; gateway: string; reference?: string }): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!(input.amount > 0)) return fail("Amount must be positive");
  const b = (await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1))[0];
  if (!b) return fail("Booking not found");
  const paid = (b.paidAmount || 0) + input.amount;
  const status = paid >= (b.total || 0) ? "paid" : "partially_paid";
  await db.insert(payments).values({ id: uid("pay"), bookingId: b.id, amount: input.amount, method: "manual", gateway: input.gateway, transactionId: input.reference || uid("tx").toUpperCase(), status: "confirmed", paidBy: b.contactName, reference: `Recorded by ${admin.name}` });
  await db.update(bookings).set({ paidAmount: paid, status }).where(eq(bookings.id, b.id));
  await db.insert(notifications).values({ id: uid("n"), userId: b.userId, title: "Payment received", message: `We received ৳${input.amount.toLocaleString()} for ${b.bookingCode}. Remaining: ৳${Math.max(0, (b.total || 0) - paid).toLocaleString()}.`, type: "payment" });
  await audit(admin.email, "payment.record", "booking", b.id, { amount: input.amount, previousPaid: b.paidAmount, newPaid: paid, gateway: input.gateway });
  refresh();
  return okay("Payment recorded");
}

export async function updateProgress(bookingId: string, steps: ProgressStep[], update?: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const b = (await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1))[0];
  if (!b) return fail("Booking not found");
  const done = steps.filter((s) => s.status === "completed").length;
  const progress = steps.length ? Math.round((done / steps.length) * 100) : 0;
  await db.update(bookings).set({ progressJson: steps, progress }).where(eq(bookings.id, bookingId));
  if (update?.trim()) {
    await db.insert(notifications).values({ id: uid("n"), userId: b.userId, title: "Trip update", message: update.trim(), type: "schedule" });
  }
  await audit(admin.email, "trip.progress", "booking", bookingId, { progress });
  refresh();
  return okay(`Progress updated to ${progress}%`);
}

export async function saveTour(input: Record<string, unknown>): Promise<Res & { id?: string }> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const parsed = tourSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid tour");
  const d = parsed.data;
  const list = (v: unknown) => String(v || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const itinerary = list(input.itinerary).map((line, i) => {
    const [title, activity] = line.split("|").map((s) => s.trim());
    return { day: i + 1, title: title || `Day ${i + 1}`, destination: "", activity: activity || "", overnight: "", meals: "" };
  });
  const dest = input.destinationId ? String(input.destinationId) : null;
  const values = {
    title: d.title, subtitle: d.subtitle || null, category: d.category || "Adventure", description: d.description || null,
    durationDays: d.durationDays ?? 2, durationNights: d.durationNights ?? 1, price: d.price ?? 0,
    discountPrice: d.discountPrice || null, departureCity: d.departureCity || "Bogura", departure: d.departureCity || "Bogura",
    difficulty: d.difficulty || "Easy", groupSize: d.groupSize ?? 20, featured: d.featured ?? false, status: d.status || "published",
    images: d.image ? [d.image, ...list(input.gallery)] : list(input.gallery), highlights: list(input.highlights),
    included: list(input.included), excluded: list(input.excluded), itinerary, destinationId: dest,
    cancellationPolicy: String(input.cancellationPolicy || "") || null, isDemo: false,
  };
  if (d.id) {
    await db.update(tours).set(values).where(eq(tours.id, d.id));
    await audit(admin.email, "tour.update", "tour", d.id, { title: d.title, price: d.price });
    refresh();
    return { ...okay("Tour updated"), id: d.id };
  }
  const id = uid("tour");
  let slug = slugify(d.title);
  const exists = await db.select().from(tours).where(eq(tours.slug, slug)).limit(1);
  if (exists.length) slug = `${slug}-${id.slice(-4)}`;
  await db.insert(tours).values({ id, slug, ...values });
  await audit(admin.email, "tour.create", "tour", id, { title: d.title });
  refresh();
  return { ...okay("Tour created"), id };
}

export async function setTourStatus(id: string, status: "draft" | "published"): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.update(tours).set({ status }).where(eq(tours.id, id));
  await audit(admin.email, "tour.status", "tour", id, { status });
  refresh();
  return okay(status === "published" ? "Tour published" : "Tour unpublished");
}

export async function duplicateTour(id: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const t = (await db.select().from(tours).where(eq(tours.id, id)).limit(1))[0];
  if (!t) return fail("Tour not found");
  const nid = uid("tour");
  const { id: _omit, createdAt: _c, ...rest } = t;
  void _omit; void _c;
  await db.insert(tours).values({ ...rest, id: nid, slug: `${t.slug}-copy-${nid.slice(-4)}`, title: `${t.title} (Copy)`, status: "draft" });
  await audit(admin.email, "tour.duplicate", "tour", nid, { from: id });
  refresh();
  return okay("Tour duplicated as draft");
}

export async function addTourDate(input: { tourId: string; date: string; seats: number; price?: number }): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!input.date) return fail("Date required");
  await db.insert(tourDates).values({ id: uid("td"), tourId: input.tourId, date: new Date(input.date), seatsTotal: input.seats || 20, seatsBooked: 0, price: input.price || null, status: "open" });
  await audit(admin.email, "tour.date.add", "tour", input.tourId, input);
  refresh();
  return okay("Departure date added");
}

export async function addExpense(input: Record<string, unknown>): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid expense");
  const d = parsed.data;
  const id = uid("exp");
  await db.insert(tripExpenses).values({ id, tripId: d.tripId || null, category: d.category, title: d.title, description: d.description || null, amount: Math.round(d.amount), paidBy: d.paidBy || admin.name, method: d.method || "Cash", date: d.date ? new Date(d.date) : new Date() });
  await audit(admin.email, "expense.create", "expense", id, { amount: d.amount, category: d.category });
  refresh();
  return okay("Expense recorded");
}

export async function deleteExpense(id: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!["admin", "super_admin", "manager"].includes(admin.role)) return fail("Insufficient permissions");
  const e = (await db.select().from(tripExpenses).where(eq(tripExpenses.id, id)).limit(1))[0];
  if (!e) return fail("Not found");
  await audit(admin.email, "expense.delete", "expense", id, e); // keep a full copy in the audit trail
  await db.delete(tripExpenses).where(eq(tripExpenses.id, id));
  refresh();
  return okay("Expense deleted (archived in audit log)");
}

export async function addParticipant(input: { tripId: string; name: string; phone?: string; email?: string; age?: number; gender?: string; seat?: string; room?: string; emergencyName?: string; emergencyPhone?: string; paymentStatus?: string }): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!input.name?.trim()) return fail("Name required");
  await db.insert(participants).values({ id: uid("p"), tripId: input.tripId, name: input.name.trim(), phone: input.phone || null, email: input.email || null, age: input.age || null, gender: input.gender || null, seat: input.seat || null, room: input.room || null, emergencyName: input.emergencyName || null, emergencyPhone: input.emergencyPhone || null, paymentStatus: input.paymentStatus || "pending" });
  refresh();
  return okay("Participant added");
}

export async function createTrip(input: { name: string; tourId?: string; route: string; startDate?: string; endDate?: string; revenue?: number }): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!input.name?.trim()) return fail("Trip name required");
  const id = uid("trip");
  await db.insert(trips).values({ id, name: input.name.trim(), tourId: input.tourId || null, route: input.route.split(/[→,>]/).map((s) => s.trim()).filter(Boolean), startDate: input.startDate ? new Date(input.startDate) : null, endDate: input.endDate ? new Date(input.endDate) : null, revenue: input.revenue || 0, status: "planning" });
  await audit(admin.email, "trip.create", "trip", id, { name: input.name });
  refresh();
  return okay("Trip group created");
}

export async function moderateReview(id: string, status: "approved" | "featured" | "pending" | "rejected"): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (status === "rejected") await db.delete(reviews).where(eq(reviews.id, id));
  else await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  await audit(admin.email, "review.moderate", "review", id, { status });
  refresh();
  return okay(`Review ${status}`);
}

export async function saveSettings(next: SiteSettings): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const clean = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, String(v ?? "").slice(0, 500)])) as unknown as SiteSettings;
  await db.insert(settings).values({ key: "site", value: clean as unknown as object }).onConflictDoUpdate({ target: settings.key, set: { value: clean as unknown as object, updatedAt: new Date() } });
  await audit(admin.email, "settings.update", "settings", "site", { keys: Object.keys(clean) });
  revalidatePath("/", "layout");
  return okay("Settings saved");
}

export async function sendAnnouncement(input: { title: string; message: string; type: string }): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  if (!input.title?.trim() || !input.message?.trim()) return fail("Title and message required");
  const all = await db.select({ id: users.id }).from(users);
  if (all.length) await db.insert(notifications).values(all.map((u) => ({ id: uid("n"), userId: u.id, title: input.title.trim(), message: input.message.trim(), type: input.type || "general" })));
  await db.insert(settings).values({ key: "announcement", value: { text: input.message.trim(), title: input.title.trim() } }).onConflictDoUpdate({ target: settings.key, set: { value: { text: input.message.trim(), title: input.title.trim() } } });
  await audit(admin.email, "announcement.send", "notification", "all", { title: input.title, recipients: all.length });
  refresh();
  return okay(`Announcement sent to ${all.length} users`);
}

export async function replyTicket(id: string, reply: string, status: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const t = (await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1))[0];
  if (!t) return fail("Ticket not found");
  await db.update(supportTickets).set({ reply: reply.trim() || null, status }).where(eq(supportTickets.id, id));
  if (t.userId && reply.trim()) await db.insert(notifications).values({ id: uid("n"), userId: t.userId, title: `Support reply: ${t.subject}`, message: reply.trim(), type: "support" });
  refresh();
  return okay("Ticket updated");
}

export async function setRequestStatus(id: string, status: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.update(customTripRequests).set({ status }).where(eq(customTripRequests.id, id));
  refresh();
  return okay("Request updated");
}

// ---- Inventory: hotels ----
export async function saveHotel(input: Record<string, unknown>): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const hotelName = String(input.hotelName || "").trim();
  if (!hotelName) return fail("Hotel name is required");
  const values = {
    hotelName,
    location: String(input.location || "") || null,
    roomType: String(input.roomType || "") || null,
    pricePerNight: Number(input.pricePerNight) || 0,
    capacity: Number(input.capacity) || 2,
    tourId: input.tourId ? String(input.tourId) : null,
    amenities: String(input.amenities || "").split("\n").map((x) => x.trim()).filter(Boolean),
    contact: String(input.contact || "") || null,
    notes: String(input.notes || "") || null,
  };
  if (input.id) {
    await db.update(hotels).set(values).where(eq(hotels.id, String(input.id)));
    await audit(admin.email, "hotel.update", "hotel", String(input.id), { hotelName });
  } else {
    const id = uid("htl");
    await db.insert(hotels).values({ id, ...values });
    await audit(admin.email, "hotel.create", "hotel", id, { hotelName });
  }
  refresh();
  return okay("Hotel saved");
}

export async function deleteHotel(id: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.delete(hotels).where(eq(hotels.id, id));
  await audit(admin.email, "hotel.delete", "hotel", id);
  refresh();
  return okay("Hotel removed");
}

// ---- Inventory: transport ----
export async function saveTransport(input: Record<string, unknown>): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const allowed = ["bus", "microbus", "car", "train", "flight", "boat", "jeep"] as const;
  const vt = String(input.vehicleType || "bus");
  if (!allowed.includes(vt as (typeof allowed)[number])) return fail("Invalid vehicle type");
  const values = {
    provider: String(input.provider || "") || null,
    vehicleType: vt as (typeof allowed)[number],
    vehicleNumber: String(input.vehicleNumber || "") || null,
    driver: String(input.driver || "") || null,
    driverPhone: String(input.driverPhone || "") || null,
    seatCapacity: Number(input.seatCapacity) || 30,
    route: String(input.route || "") || null,
    cost: Number(input.cost) || 0,
    tourId: input.tourId ? String(input.tourId) : null,
  };
  if (input.id) {
    await db.update(transport).set(values).where(eq(transport.id, String(input.id)));
    await audit(admin.email, "transport.update", "transport", String(input.id), { vt });
  } else {
    const id = uid("trn");
    await db.insert(transport).values({ id, ...values });
    await audit(admin.email, "transport.create", "transport", id, { vt });
  }
  refresh();
  return okay("Transport saved");
}

export async function deleteTransport(id: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.delete(transport).where(eq(transport.id, id));
  await audit(admin.email, "transport.delete", "transport", id);
  refresh();
  return okay("Transport removed");
}

// ---- Trip stages (live progress) ----
export async function saveTripStages(tripId: string, stages: { label: string; status: string; note?: string; location?: string }[]): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const trip = (await db.select().from(trips).where(eq(trips.id, tripId)).limit(1))[0];
  if (!trip) return fail("Trip not found");
  const allowed = ["completed", "upcoming", "delayed", "cancelled"] as const;
  await db.delete(tripStages).where(eq(tripStages.tripId, tripId));
  if (stages.length) {
    await db.insert(tripStages).values(
      stages.map((s, i) => ({
        id: uid("stg"), tripId, label: String(s.label || `Stage ${i + 1}`).slice(0, 160),
        position: i,
        status: (allowed.includes(s.status as (typeof allowed)[number]) ? s.status : "upcoming") as (typeof allowed)[number],
        note: s.note?.slice(0, 400) || null,
        location: s.location?.slice(0, 160) || null,
        occurredAt: s.status === "completed" ? new Date() : null,
      })),
    );
  }
  const done = stages.filter((s) => s.status === "completed").length;
  const progress = stages.length ? Math.round((done / stages.length) * 100) : 0;
  await db.update(trips).set({ status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "planning" }).where(eq(trips.id, tripId));
  await audit(admin.email, "trip.stages", "trip", tripId, { progress, stages: stages.length });
  refresh();
  return okay(`Trip stages saved — ${progress}% complete`);
}

export async function logTripUpdate(tripId: string, message: string, location?: string): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  const msg = String(message || "").trim();
  if (!msg) return fail("Message is required");
  await db.insert(tripProgressLogs).values({ id: uid("log"), tripId, message: msg.slice(0, 400), location: location?.slice(0, 160) || null, actor: admin.name });
  const trip = (await db.select().from(trips).where(eq(trips.id, tripId)).limit(1))[0];
  if (trip) {
    const members = await db.select().from(participants).where(eq(participants.tripId, tripId));
    void members;
  }
  await audit(admin.email, "trip.log", "trip", tripId, { message: msg });
  refresh();
  return okay("Live update posted");
}

export async function setDestinationPublished(id: string, published: boolean): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.update(destinations).set({ published, updatedAt: new Date() }).where(eq(destinations.id, id));
  await audit(admin.email, "destination.publish", "destination", id, { published });
  refresh();
  return okay(published ? "Destination published" : "Destination hidden");
}

export async function setDestinationFeatured(id: string, featured: boolean): Promise<Res> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized");
  await db.update(destinations).set({ featured }).where(eq(destinations.id, id));
  refresh();
  return okay(featured ? "Destination featured on homepage" : "Destination removed from homepage");
}
