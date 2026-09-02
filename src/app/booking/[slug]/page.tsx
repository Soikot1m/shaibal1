import { notFound, redirect } from "next/navigation";
import { getTourBySlug, getTourDates } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { BookingWizard } from "@/components/booking-wizard";
import { SectionHeading } from "@/components/ui";

export const metadata = { title: "Book your tour" };

export default async function BookingPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ date?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();
  if (tour.price === 0) redirect("/contact?type=custom");
  const [dates, user] = await Promise.all([getTourDates(tour.id), getSessionUser()]);
  const eff = tour.discountPrice && tour.discountPrice > 0 ? tour.discountPrice : tour.price;
  const dateOpts = dates
    .filter((d) => d.date > new Date())
    .map((d) => ({ id: d.id, date: d.date.toISOString().split("T")[0], seatsLeft: (d.seatsTotal || 0) - (d.seatsBooked || 0), price: d.price || eff }));

  return (
    <div className="container-x pt-24 pb-16">
      <SectionHeading align="left" eyebrow="Secure booking" title={`Book: ${tour.title}`} sub="Complete the steps below — it takes about two minutes." />
      <BookingWizard
        tour={{ id: tour.id, slug: tour.slug, title: tour.title, price: eff, image: tour.images?.[0] || "", duration: `${tour.durationDays}D ${tour.durationNights}N`, departure: tour.departureCity || "Bogura" }}
        dates={dateOpts}
        initialDate={sp.date}
        user={user ? { name: user.name, email: user.email, phone: user.phone } : null}
      />
    </div>
  );
}
