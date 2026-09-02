import { NextResponse } from "next/server";
import { getPublishedTours } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const category = searchParams.get("category");
  const tours = (await getPublishedTours()).filter((t) => (!q || t.title.toLowerCase().includes(q)) && (!category || t.category === category));
  return NextResponse.json({
    tours: tours.map((t) => ({ id: t.id, slug: t.slug, title: t.title, category: t.category, price: t.discountPrice || t.price, days: t.durationDays, nights: t.durationNights, rating: t.rating, image: t.images?.[0] })),
  });
}
