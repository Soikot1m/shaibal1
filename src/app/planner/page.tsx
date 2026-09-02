import { getPublishedTours, getDestinations } from "@/lib/data";
import { Planner } from "@/components/planner";
import { SectionHeading } from "@/components/ui";

export const metadata = { title: "Travel Planner", description: "Plan a day-by-day itinerary with budget, packing checklist and AI travel assistant — Shaibal Tours & Travels." };

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ destination?: string }> }) {
  const sp = await searchParams;
  const [tours, dests] = await Promise.all([getPublishedTours(), getDestinations()]);
  const destName = new Map(dests.map((d) => [d.id, d.name]));
  const lite = tours
    .filter((t) => t.price > 0)
    .map((t) => ({ slug: t.slug, title: t.title, destination: destName.get(t.destinationId || "") || t.departureCity || "", price: t.discountPrice || t.price, days: t.durationDays || 1, itinerary: t.itinerary || [], category: t.category, image: t.images?.[0] || "" }));

  return (
    <div className="container-x pt-28 pb-16">
      <SectionHeading align="center" eyebrow="Travel planner" title={<>Design your <em>perfect itinerary</em></>} sub="Set destination, dates, people and budget. We build a day-by-day plan from our real tour itineraries — with a live budget, packing checklist and shareable link." />
      <Planner tours={lite} initialDestination={sp.destination || ""} />
    </div>
  );
}
