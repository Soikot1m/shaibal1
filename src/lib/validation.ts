import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address").max(160);
export const phoneSchema = z.string().trim().min(6, "Enter a valid phone number").max(30);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: emailSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const bookingSubmitSchema = z.object({
  tourId: z.string().optional(),
  tourDateId: z.string().optional(),
  tourTitle: z.string().optional(),
  date: z.string().optional(),
  contactName: z.string().trim().min(2),
  contactPhone: phoneSchema,
  contactEmail: emailSchema,
  emergencyName: z.string().trim().min(2).optional(),
  emergencyPhone: z.string().optional(),
  specialRequests: z.string().max(2000).optional(),
  total: z.number().nonnegative().optional(),
  travelers: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Traveler name required"),
        age: z.string().optional(),
        gender: z.string().optional(),
        nid: z.string().optional(),
      }),
    )
    .optional(),
});

export const reviewSchema = z.object({
  tourId: z.string().optional(),
  rating: z.number().min(1).max(5),
  author: z.string().trim().min(2),
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(10).max(3000),
  travelDate: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(5000),
});

export const customTripSchema = z.object({
  name: z.string().trim().min(2),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
  destination: z.string().trim().min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelers: z.coerce.number().min(1).max(100).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  requirements: z.string().max(3000).optional(),
});

export const ticketSchema = z.object({
  name: z.string().trim().min(2),
  email: emailSchema.optional().or(z.literal("")),
  subject: z.string().trim().min(2),
  category: z.string().optional(),
  message: z.string().trim().min(5).max(4000),
  priority: z.string().optional(),
});

export const newsletterSchema = z.object({ email: emailSchema });

export const tourSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2),
  subtitle: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  durationDays: z.coerce.number().int().min(0).optional(),
  durationNights: z.coerce.number().int().min(0).optional(),
  price: z.coerce.number().nonnegative().optional(),
  discountPrice: z.coerce.number().nonnegative().nullable().optional(),
  departureCity: z.string().optional(),
  difficulty: z.string().optional(),
  groupSize: z.coerce.number().int().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  image: z.string().optional(),
});

export const expenseSchema = z.object({
  tripId: z.string().optional(),
  category: z.string(),
  title: z.string().trim().min(2),
  description: z.string().optional(),
  amount: z.coerce.number().nonnegative(),
  paidBy: z.string().optional(),
  method: z.string().optional(),
  date: z.string().optional(),
});
