import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";

// ---- Identity / Auth ----
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["customer", "staff", "manager", "admin", "super_admin"],
  })
    .notNull()
    .default("customer"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.token)],
);

// ---- Catalog ----
export const destinations = pgTable(
  "destinations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    country: text("country").notNull().default("Bangladesh"),
    region: text("region"),
    headline: text("headline"),
    type: text("type").notNull().default("Nature"), // mountains/beach/cultural...
    description: text("description"),
    image: text("image"),
    gallery: jsonb("gallery").$type<string[]>().default([]),
    bestTime: text("best_time"),
    budget: integer("budget").default(0),
    activities: jsonb("activities").$type<string[]>().default([]),
    lat: real("lat"),
    lng: real("lng"),
    popularity: integer("popularity").default(0),
    featured: boolean("featured").default(false),
    isInternational: boolean("is_international").default(false),
    published: boolean("published").notNull().default(true),
    isDemo: boolean("is_demo").default(true),
    travelTips: jsonb("travel_tips").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("dest_slug_uq").on(t.slug), index("dest_published_idx").on(t.published)],
);

export const tours = pgTable(
  "tours",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    destinationId: text("destination_id").references(() => destinations.id, {
      onDelete: "set null",
    }),
    category: text("category").notNull().default("Adventure"),
    description: text("description"),
    highlights: jsonb("highlights").$type<string[]>().default([]),
    durationDays: integer("duration_days").default(2),
    durationNights: integer("duration_nights").default(1),
    price: integer("price").notNull().default(0),
    discountPrice: integer("discount_price"),
    departure: text("departure").default("Bogura"),
    departureCity: text("departure_city").default("Bogura"),
    difficulty: text("difficulty").default("Easy"),
    groupSize: integer("group_size").default(20),
    rating: real("rating").default(0),
    travelerCount: integer("traveler_count").default(0),
    included: jsonb("included").$type<string[]>().default([]),
    excluded: jsonb("excluded").$type<string[]>().default([]),
    itinerary: jsonb("itinerary").$type<ItineraryDay[]>().default([]),
    images: jsonb("images").$type<string[]>().default([]),
    video: text("video"),
    lat: real("lat"),
    lng: real("lng"),
    faq: jsonb("faq").$type<{ q: string; a: string }[]>().default([]),
    cancellationPolicy: text("cancellation_policy"),
    requiredItems: jsonb("required_items").$type<string[]>().default([]),
    shortDescription: text("short_description"),
    returnLocation: text("return_location"),
    currency: text("currency").notNull().default("BDT"),
    accommodation: text("accommodation"),
    transportInfo: text("transport_info"),
    mealInfo: text("meal_info"),
    importantNotes: jsonb("important_notes").$type<string[]>().default([]),
    bookingInfo: text("booking_info"),
    coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }[]>(),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("published"),
    featured: boolean("featured").default(false),
    published: boolean("published").notNull().default(true),
    isDemo: boolean("is_demo").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("tour_slug_uq").on(t.slug), index("tour_published_idx").on(t.published)],
);

export const tourDates = pgTable(
  "tour_dates",
  {
    id: text("id").primaryKey(),
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    seatsTotal: integer("seats_total").default(20),
    seatsBooked: integer("seats_booked").default(0),
    price: integer("price"),
    status: text("status", {
      enum: ["open", "almost_full", "full", "cancelled", "completed"],
    })
      .notNull()
      .default("open"),
  },
  (t) => [index("td_tour_idx").on(t.tourId), index("td_date_idx").on(t.date)],
);

/** Derived seat availability — the single source of truth for the frontend. */
export function seatsLeft(d: { seatsTotal: number | null; seatsBooked: number | null }) {
  return Math.max(0, (d.seatsTotal ?? 0) - (d.seatsBooked ?? 0));
}

export function tourDateStatus(d: { seatsTotal: number | null; seatsBooked: number | null }) {
  const left = seatsLeft(d);
  const total = d.seatsTotal ?? 0;
  if (left === 0) return "full" as const;
  if (total > 0 && left <= Math.ceil(total * 0.2)) return "almost_full" as const;
  return "open" as const;
}

/** Per-traveller records for a booking. */
export const bookingTravelers = pgTable(
  "booking_travelers",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    age: integer("age"),
    gender: text("gender"),
    nid: text("nid"),
    phone: text("phone"),
    email: text("email"),
    emergencyContact: text("emergency_contact"),
    specialRequirements: text("special_requirements"),
    seat: text("seat"),
    room: text("room"),
    paymentStatus: text("payment_status").default("unpaid"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("bt_booking_idx").on(t.bookingId)],
);

/** Immutable audit trail of every booking status change. */
export const bookingStatusHistory = pgTable(
  "booking_status_history",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actor: text("actor"),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("bsh_booking_idx").on(t.bookingId)],
);

// ---- Inventory: hotels & transport ----
export const hotels = pgTable("hotels", {
  id: text("id").primaryKey(),
  tourId: text("tour_id").references(() => tours.id, { onDelete: "set null" }),
  tripId: text("trip_id").references(() => trips.id, { onDelete: "set null" }),
  hotelName: text("hotel_name").notNull(),
  location: text("location"),
  roomType: text("room_type"),
  pricePerNight: integer("price_per_night").default(0),
  capacity: integer("capacity").default(2),
  checkIn: timestamp("check_in", { withTimezone: true }),
  checkOut: timestamp("check_out", { withTimezone: true }),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  contact: text("contact"),
  images: jsonb("images").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const transport = pgTable("transport", {
  id: text("id").primaryKey(),
  tourId: text("tour_id").references(() => tours.id, { onDelete: "set null" }),
  tripId: text("trip_id").references(() => trips.id, { onDelete: "set null" }),
  provider: text("provider"),
  vehicleType: text("vehicle_type", {
    enum: ["bus", "microbus", "car", "train", "flight", "boat", "jeep"],
  })
    .notNull()
    .default("bus"),
  vehicleNumber: text("vehicle_number"),
  driver: text("driver"),
  driverPhone: text("driver_phone"),
  seatCapacity: integer("seat_capacity").default(30),
  departureTime: timestamp("departure_time", { withTimezone: true }),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }),
  route: text("route"),
  cost: integer("cost").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** Individual stages of a live trip, updated by admin during travel. */
export const tripStages = pgTable(
  "trip_stages",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    position: integer("position").notNull().default(0),
    status: text("status", {
      enum: ["completed", "upcoming", "delayed", "cancelled"],
    })
      .notNull()
      .default("upcoming"),
    note: text("note"),
    location: text("location"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
  },
  (t) => [index("ts_trip_idx").on(t.tripId)],
);

export const tripProgressLogs = pgTable(
  "trip_progress_logs",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    location: text("location"),
    actor: text("actor"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("tpl_trip_idx").on(t.tripId)],
);

// ---- Bookings ----
export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    bookingCode: text("booking_code").notNull(),
    tourId: text("tour_id").references(() => tours.id, {
      onDelete: "set null",
    }),
    tourDateId: text("tour_date_id").references(() => tourDates.id, {
      onDelete: "set null",
    }),
    tourTitle: text("tour_title"),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    contactName: text("contact_name"),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    emergencyName: text("emergency_name"),
    emergencyPhone: text("emergency_phone"),
    date: timestamp("date", { withTimezone: true }),
    travelers: jsonb("travelers").$type<Traveler[]>().default([]),
    preferences: jsonb("preferences").$type<Record<string, string>>().default({}),
    specialRequests: text("special_requests"),
    total: integer("total").default(0),
    paidAmount: integer("paid_amount").default(0),
    status: text("status", {
      enum: [
        "pending",
        "confirmed",
        "paid",
        "partially_paid",
        "cancelled",
        "completed",
      ],
    })
      .notNull()
      .default("pending"),
    progress: integer("progress").default(0),
    progressJson: jsonb("progress_json").$type<ProgressStep[]>().default([]),
    createdBy: text("created_by", { enum: ["public", "admin"] }).default("public"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("booking_user_idx").on(t.userId), index("booking_tour_idx").on(t.tourId)],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    method: text("method").default("online"),
    gateway: text("gateway").default("bKash"),
    transactionId: text("transaction_id"),
    status: text("status").default("pending"),
    paidBy: text("paid_by"),
    reference: text("reference"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("pay_booking_idx").on(t.bookingId)],
);

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  tourId: text("tour_id"),
  author: text("author").notNull(),
  rating: real("rating").notNull().default(5),
  title: text("title"),
  content: text("content").notNull(),
  travelDate: text("travel_date"),
  photos: jsonb("photos").$type<string[]>().default([]),
  status: text("status", { enum: ["pending", "approved", "featured"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    entityType: text("entity_type").notNull(), // tour/destination/blog
    entityId: text("entity_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("fav_uq").on(t.userId, t.entityType, t.entityId)],
);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").default("general"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---- Content ----
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    cover: text("cover"),
    category: text("category").default("Travel Tips"),
    author: text("author").default("Shaibal Tours & Travels"),
    readingTime: text("reading_time"),
    published: boolean("published").default(true),
    isDemo: boolean("is_demo").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("blog_slug_uq").on(t.slug)],
);

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  category: text("category").default("Booking"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  id: text("id").primaryKey(),
  image: text("image").notNull(),
  title: text("title"),
  category: text("category").default("Mountains"),
  destination: text("destination"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---- Operations / finance ----
export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  tourId: text("tour_id").references(() => tours.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  route: jsonb("route").$type<string[]>().default([]),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  revenue: integer("revenue").default(0),
  status: text("status").default("planning"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const participants = pgTable("participants", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  age: integer("age"),
  gender: text("gender"),
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  paymentStatus: text("payment_status").default("pending"),
  seat: text("seat"),
  room: text("room"),
  special: text("special"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const tripExpenses = pgTable("trip_expenses", {
  id: text("id").primaryKey(),
  tripId: text("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("Transport"),
  title: text("title").notNull(),
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  paidBy: text("paid_by"),
  method: text("method"),
  date: timestamp("date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customTripRequests = pgTable("custom_trip_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  travelers: integer("travelers").default(1),
  budget: integer("budget").default(0),
  requirements: text("requirements"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  email: text("email"),
  subject: text("subject").notNull(),
  category: text("category").default("General"),
  message: text("message").notNull(),
  priority: text("priority").default("normal"),
  status: text("status").default("open"),
  reply: text("reply"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actor: text("actor"),
  action: text("action").notNull(),
  entity: text("entity"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---- Settings / cms ----
export const settings = pgTable(
  "settings",
  {
    key: text("key").primaryKey(),
    value: jsonb("value"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("settings_key_idx").on(t.key)],
);

// ---- Types shared across app ----
export interface ItineraryDay {
  day: number;
  title: string;
  destination: string;
  activity: string;
  overnight: string;
  meals: string;
}

export interface Traveler {
  name: string;
  age?: string;
  gender?: string;
  nid?: string;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: "completed" | "upcoming" | "delayed" | "cancelled";
  detail?: string;
}

export type DB = typeof dbTables;

// re-exported convenience
const dbTables = {
  users,
  sessions,
  destinations,
  tours,
  tourDates,
  bookings,
  payments,
  reviews,
  favorites,
  notifications,
  blogPosts,
  faqs,
  galleryItems,
  contactSubmissions,
  newsletterSubscribers,
  trips,
  participants,
  tripExpenses,
  customTripRequests,
  supportTickets,
  auditLogs,
  settings,
};

export default dbTables;
