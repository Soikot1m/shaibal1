/* Demo seed data for Shaibal Tours & Travels. All content is clearly demo.
   Run with: npx tsx src/db/seed.ts
*/
import "./env";
import { randomBytes, scryptSync, randomUUID } from "crypto";
import { db, pool } from "./index";
import * as s from "./schema";
import { IMG } from "../lib/images";

function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(8, 0, 0, 0);
  return d;
}

const uid = () => randomUUID();

async function clearTables() {
  const tables = [
    "sessions", "payments", "bookings", "participants", "trip_expenses",
    "trips", "tour_dates", "reviews", "favorites", "notifications",
    "gallery_items", "blog_posts", "faqs", "contact_submissions",
    "newsletter_subscribers", "custom_trip_requests", "support_tickets",
    "audit_logs", "tours", "destinations", "users", "settings",
  ];
  for (const t of tables) {
    try {
      await pool.query(`TRUNCATE TABLE "${t}" CASCADE`);
    } catch {
      /* ignore */
    }
  }
}

interface Dest {
  slug: string; name: string; country: string; region: string; headline: string; type: string;
  description: string; image: string; gallery: string[]; bestTime: string; budget: number;
  activities: string[]; lat: number; lng: number; popularity: number; featured: boolean; isInternational: boolean;
}

interface Tour {
  id: string; slug: string; title: string; subtitle: string; destinationId: string; category: string;
  description: string; highlights: string[]; durationDays: number; durationNights: number; price: number;
  discountPrice: number | null; departureCity: string; difficulty: string; groupSize: number; rating: number;
  travelerCount: number; included: string[]; excluded: string[]; itinerary: s.ItineraryDay[]; images: string[];
  lat: number | null; lng: number | null; faq: { q: string; a: string }[]; cancellationPolicy: string;
  requiredItems: string[]; featured: boolean;
}

async function main() {
  // Guard rail: seeding wipes the database and inserts demo content. It must be
  // explicitly enabled so it can never run against a production database.
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    console.error(
      "\nREFUSED: this seed script deletes ALL existing data and inserts demo content.\n" +
      "Set ALLOW_DEMO_SEED=true to confirm you are targeting a development database.\n",
    );
    process.exit(1);
  }
  await clearTables();

  const ADMIN_ID = uid();
  const CUST_ID = uid();
  const CUST2 = uid();
  await db.insert(s.users).values([
    { id: ADMIN_ID, name: "Shaibal Tours Admin", email: "admin@shaibaltours.com", passwordHash: hashPassword("shaibal123"), role: "super_admin" },
    { id: CUST_ID, name: "Rahim Ahmed", email: "demo@shaibaltours.com", phone: "+8801711111111", passwordHash: hashPassword("shaibal123"), role: "customer" },
    { id: CUST2, name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+8801811111111", passwordHash: hashPassword("shaibal123"), role: "customer" },
  ]);

  // ---- Destinations ----
  const dlist: Dest[] = [
    { slug: "bandarban", name: "Bandarban", country: "Bangladesh", region: "Chittagong Hill Tracts", headline: "Into the Hills", type: "Mountains", description: "A land of green hills, tribal cultures and misty valleys. Bandarban offers the deepest wilderness of Bangladesh with treks, waterfalls and breathtaking viewpoints.", image: IMG.greenHills, gallery: [IMG.greenHills, IMG.cloudMountains, IMG.sajekHills, IMG.ruralBandarban], bestTime: "Oct – Mar", budget: 8500, activities: ["Trekking", "Waterfalls", "Tribal villages", "Sunrise viewpoints", "Boating on Sangu"], lat: 22.2, lng: 92.2, popularity: 96, featured: true, isInternational: false },
    { slug: "coxs-bazar", name: "Cox's Bazar", country: "Bangladesh", region: "Chittagong", headline: "Where the Horizon Meets the Sea", type: "Beach", description: "Home to the world's longest natural sea beach. Endless golden sands, seafood, sunsets and nearby Himchari & Inani make Cox's Bazar unforgettable.", image: IMG.coxBazarSunset, gallery: [IMG.coxBazarSunset, IMG.coxBazar, IMG.beachChairs, IMG.fisherman], bestTime: "Nov – Mar", budget: 9500, activities: ["Beach walks", "Sunset cruise", "Himchari waterfall", "Inani beach", "Seafood"], lat: 21.43, lng: 91.99, popularity: 100, featured: true, isInternational: false },
    { slug: "sajek-valley", name: "Sajek Valley", country: "Bangladesh", region: "Rangamati", headline: "Valley Above the Clouds", type: "Mountains", description: "Sajek sits on the border hills, surrounded by a sea of clouds. A favourite retreat for sunrise chasers and photographers.", image: IMG.sajekHills, gallery: [IMG.sajekHills, IMG.sajekRainbow, IMG.cloudMountains, IMG.greenHills], bestTime: "Oct – Mar", budget: 8000, activities: ["Cloud-sea sunrise", "Photography", "Ridge treks", "Cottage stays", "Bonfire"], lat: 23.38, lng: 92.31, popularity: 93, featured: true, isInternational: false },
    { slug: "sylhet", name: "Sylhet & Sreemangal", country: "Bangladesh", region: "Sylhet", headline: "The Tea Capital", type: "Nature", description: "Rolling tea gardens, rainforest waterfalls and the gentle hills of Ratargul — a green escape in the northeast.", image: IMG.teaGarden, gallery: [IMG.teaGarden, IMG.teaLeaves, IMG.teaGardenOpen, IMG.lakeBoats], bestTime: "Nov – Mar", budget: 7000, activities: ["Tea garden walks", "Ratargul swamp forest", "Jaflong", "Seven Sisters waterfall", "Orchards"], lat: 24.31, lng: 91.73, popularity: 88, featured: true, isInternational: false },
    { slug: "sundarbans", name: "Sundarbans", country: "Bangladesh", region: "Khulna", headline: "The Mangrove Kingdom", type: "Adventure", description: "The largest mangrove forest on Earth and home of the Royal Bengal Tiger. A once-in-a-lifetime river safari.", image: IMG.mangrove, gallery: [IMG.mangrove, IMG.mangroveAerial, IMG.mangroveBoat, IMG.lakeBoats], bestTime: "Nov – Feb", budget: 14000, activities: ["River cruise", "Wildlife spotting", "Kotka beach", "Forest trekking", "Birdwatching"], lat: 21.94, lng: 89.18, popularity: 90, featured: true, isInternational: false },
    { slug: "rangamati", name: "Rangamati", country: "Bangladesh", region: "Chittagong Hill Tracts", headline: "Kaptai Lakeside", type: "Nature", description: "Kaptai Lake's calm blue waters and the verdant hills of Rangamati offer boating, tribal villages and floating memories.", image: IMG.lakeBoats, gallery: [IMG.lakeBoats, IMG.lakeBoat, IMG.sajekRainbow, IMG.palmHills], bestTime: "Oct – Mar", budget: 8000, activities: ["Kaptai boat ride", "Hanging bridge", "Shuvolong waterfall", "Tribal crafts", "Pedaling rafts"], lat: 22.65, lng: 92.18, popularity: 85, featured: true, isInternational: false },
    { slug: "kuakata", name: "Kuakata", country: "Bangladesh", region: "Barishal", headline: "Beach of Two Suns", type: "Beach", description: "A rare beach where you can watch both sunrise and sunset from the shore — plus the Buddhist heritage of the Rakhine community.", image: IMG.beachChairs, gallery: [IMG.beachChairs, IMG.coxBazarBeach, IMG.lakeBoat, IMG.fisherman], bestTime: "Nov – Mar", budget: 7500, activities: ["Sunrise & sunset", "Fatrar char", "Rakhine villages", "Misri Para", "Beach walks"], lat: 21.82, lng: 90.12, popularity: 78, featured: false, isInternational: false },
    { slug: "chittagong", name: "Chittagong", country: "Bangladesh", region: "Chittagong", headline: "Gateway to the South", type: "Cultural", description: "The port city blends hills, sea and heritage — from Foy's Lake to Patenga, a perfect stop on the coastal route.", image: IMG.lakeBoat, gallery: [IMG.lakeBoat, IMG.ruralBandarban, IMG.beachChairs, IMG.cloudMountains], bestTime: "Oct – Mar", budget: 6500, activities: ["Foy's Lake", "Patenga sea beach", "Bhatiary hills", "CRB hills", "Seafood markets"], lat: 22.35, lng: 91.78, popularity: 80, featured: false, isInternational: false },
    { slug: "bogura", name: "Bogura", country: "Bangladesh", region: "Rajshahi", headline: "Where We Call Home", type: "Cultural", description: "The historic heart of Bengal — Mahasthangarh, ancient mosques and warm hospitality. Our headquarters city.", image: IMG.palmHills, gallery: [IMG.palmHills, IMG.teaGardenOpen, IMG.lakeBoats, IMG.coxBazarSunset], bestTime: "Nov – Mar", budget: 4500, activities: ["Mahasthangarh", "Bihar", "Kherua mosque", "Sweet shops", "Riverbanks"], lat: 24.85, lng: 89.37, popularity: 70, featured: false, isInternational: false },
    { slug: "dhaka", name: "Dhaka", country: "Bangladesh", region: "Dhaka", headline: "The Busy Capital", type: "Cultural", description: "The bustling megacity is the main gateway for every tour and the first taste of Bangladesh's vibrant culture.", image: IMG.ruralBandarban, gallery: [IMG.ruralBandarban, IMG.teaGarden, IMG.sajekRainbow, IMG.coxBazar], bestTime: "All year", budget: 5000, activities: ["Old Dhaka", "Lalbagh Fort", "Riverside", "Food streets", "Market tours"], lat: 23.81, lng: 90.41, popularity: 75, featured: false, isInternational: false },
    { slug: "nepal", name: "Kathmandu, Nepal", country: "Nepal", region: "Himalaya", headline: "Roof of the World", type: "International", description: "Stupas, prayer flags and Himalayan sunrises — a spiritual and adventurous gateway to the mountains.", image: IMG.nepalStupa, gallery: [IMG.nepalStupa, IMG.nepalPatan, IMG.nepalBoudha, IMG.hikerSunrise], bestTime: "Oct – Apr", budget: 55000, activities: ["Stupas", "Temples", "Himalaya views", "Adventure sports", "Street culture"], lat: 27.72, lng: 85.32, popularity: 92, featured: true, isInternational: true },
    { slug: "thailand", name: "Bangkok, Thailand", country: "Thailand", region: "SE Asia", headline: "Land of Smiles", type: "International", description: "Golden temples, floating markets and vibrant nightlife — Southeast Asia's most accessible destination.", image: IMG.thailandPalace, gallery: [IMG.thailandPalace, IMG.thailandTemple, IMG.thailandEmerald, IMG.thailandWatPho], bestTime: "Nov – Mar", budget: 62000, activities: ["Temples", "Floating market", "Shopping", "Nightlife", "Street food"], lat: 13.75, lng: 100.5, popularity: 95, featured: true, isInternational: true },
    { slug: "kuala-lumpur", name: "Kuala Lumpur, Malaysia", country: "Malaysia", region: "SE Asia", headline: "A City of Towers", type: "International", description: "Modern towers, colonial history and island escapes — a comfortable first international trip from Bangladesh.", image: IMG.poolDanang, gallery: [IMG.poolDanang, IMG.resortPool, IMG.coupleBalcony, IMG.infinityPool], bestTime: "Nov – Mar", budget: 58000, activities: ["Petronas Towers", "Genting", "Theme parks", "Shopping", "Food"], lat: 3.13, lng: 101.68, popularity: 90, featured: true, isInternational: true },
    { slug: "india", name: "Varanasi, India", country: "India", region: "South Asia", headline: "Sacred Ganges", type: "International", description: "Ancient ghats, spiritual ceremonies and timeless heritage along the holy Ganges in Uttar Pradesh.", image: IMG.thailandWatPho, gallery: [IMG.thailandWatPho, IMG.nepalPatan, IMG.coupleWalk, IMG.teaGarden], bestTime: "Oct – Mar", budget: 48000, activities: ["Ganga aarti", "Old city walks", "Heritage sights", "River cruises", "Food"], lat: 25.31, lng: 83.0, popularity: 82, featured: false, isInternational: true },
  ];
  const destRows = dlist.map((d, i) => ({
    id: uid(), slug: d.slug, name: d.name, country: d.country, region: d.region, headline: d.headline,
    type: d.type, description: d.description, image: d.image, gallery: d.gallery, bestTime: d.bestTime,
    budget: d.budget, activities: d.activities, lat: d.lat, lng: d.lng, popularity: d.popularity,
    featured: d.featured, isInternational: d.isInternational, published: true, isDemo: true,
  }));
  await db.insert(s.destinations).values(destRows);
  const destById = new Map(dlist.map((d, i) => [d.slug, destRows[i].id]));

  // ---- Tours ----
  const mk = (t: Partial<Tour> & { slug: string; title: string; price: number; destSlug: string; days: number; nights: number }): Tour => {
    const dest = dlist.find((d) => d.slug === t.destSlug)!;
    const base: Tour = {
      id: uid(), category: "Adventure", departureCity: "Bogura", difficulty: "Easy", groupSize: 20,
      durationDays: t.days, durationNights: t.nights,
      rating: 4.8, travelerCount: 60, description: "",
      highlights: ["Round-trip travel", "Local guide", "Live updates"],
      included: ["AC transport", "Tour guide", "Accommodation", "Breakfast & selected meals", "Entry fees", "Photography stops"],
      excluded: ["Personal shopping", "Insurance", "Visa & airfare (international)", "Lunch/dinner unless stated"],
      itinerary: [], images: [dest.image, ...dest.gallery.slice(1, 4)], lat: dest.lat, lng: dest.lng,
      faq: [],
      cancellationPolicy: "Free cancellation up to 7 days before departure. 50% refund within 72 hours. No refund for no-show.",
      requiredItems: ["Valid NID / Passport", "Comfortable shoes", "Personal medication", "Power bank", "Light jacket"],
      featured: true, discountPrice: null, subtitle: "",
      ...t,
      destinationId: destById.get(t.destSlug)!,
    };
    return base;
  };

  const t1 = mk({ slug: "bandarban-adventure", title: "Bandarban Adventure", subtitle: "Hills, waterfalls & tribal culture", destSlug: "bandarban", days: 3, nights: 2, price: 8500, discountPrice: 7900, difficulty: "Moderate", rating: 4.9, travelerCount: 220, category: "Adventure", description: "A cinematic three-day escape into the deepest green hills of Bangladesh. Trek Ridang Parjatan, chase the Nilgiri & Thanchi viewpoints, visit tribal villages and relax by the Sangu river.", highlights: ["Nilgiri & Thanchi viewpoints", "Ridang Parjatan sunrise trek", "Boga lake", "Tribal village visit", "Bonfire night"], included: ["AC transport from Bogura", "2 nights hillside cottage", "Breakfast & 1 BBQ dinner", "Local guide & entry fees", "Trekking support"], itinerary: [
    { day: 1, title: "Bogura → Chittagong → Bandarban", destination: "Bandarban", activity: "Drive and check-in. Evening stroll at Chimbuk or local market.", overnight: "Bandarban cottage", meals: "Dinner" },
    { day: 2, title: "Nilgiri & Thanchi", destination: "Nilgiri / Thanchi", activity: "Sunrise at Nilgiri, boating on the Sangu, Boga lake and waterfall.", overnight: "Bandarban", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return journey", destination: "Bandarban → Bogura", activity: "Early Ridang Parjatan viewpoint, breakfast, scenic return.", overnight: "—", meals: "Breakfast" },
  ] });
  const t2 = mk({ slug: "coxs-bazar-escape", title: "Cox's Bazar Escape", subtitle: "World's longest sea beach", destSlug: "coxs-bazar", days: 3, nights: 2, price: 9500, discountPrice: 8900, difficulty: "Easy", rating: 4.9, travelerCount: 310, category: "Beach", description: "Golden sands, freshest seafood and unforgettable sunsets. From the main beach to Himchari and Inani, unwind beside the Bay of Bengal.", highlights: ["Longest beach sunrise", "Himchari waterfall", "Inani coral beach", "Sunset cruise", "Seafood dinner"], itinerary: [
    { day: 1, title: "Bogura → Cox's Bazar", destination: "Cox's Bazar", activity: "Scenic drive with Chittagong coastal views. Evening at the beach.", overnight: "Beach hotel", meals: "Dinner" },
    { day: 2, title: "Himchari & Inani", destination: "Himchari / Inani", activity: "Himchari waterfall & hills, afternoon Inani beach, sunset by the sea.", overnight: "Cox's Bazar", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return journey", destination: "Cox's Bazar → Bogura", activity: "Morning beach walk, shopping, return drive.", overnight: "—", meals: "Breakfast" },
  ] });
  const t3 = mk({ slug: "sajek-valley-experience", title: "Sajek Valley Experience", subtitle: "Above the sea of clouds", destSlug: "sajek-valley", days: 3, nights: 2, price: 8000, discountPrice: 7400, difficulty: "Moderate", rating: 4.8, travelerCount: 195, category: "Mountains", description: "Winding mountain roads lead to the fabled Sajek — a valley wrapped in clouds, best seen at golden hour and sunrise.", highlights: ["Cloud-sea sunrise", "Konglak hills", "Tribal cottages", "Bonfire & music night"], itinerary: [
    { day: 1, title: "Bogura → Khagrachari → Sajek", destination: "Sajek", activity: "Long but scenic mountain drive. Sunset viewpoint and bonfire.", overnight: "Sajek cottage", meals: "Dinner" },
    { day: 2, title: "Konglak & cloud sea", destination: "Sajek Valley", activity: "Sunrise over the clouds, Konglak hillside trek, hamlet walk.", overnight: "Sajek", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return journey", destination: "Sajek → Bogura", activity: "Morning photos, return drive.", overnight: "—", meals: "Breakfast" },
  ] });
  const t4 = mk({ slug: "sylhet-nature-tour", title: "Sylhet Nature Tour", subtitle: "Tea gardens & rainforests", destSlug: "sylhet", days: 3, nights: 2, price: 7000, discountPrice: 6500, difficulty: "Easy", rating: 4.7, travelerCount: 150, category: "Nature", description: "Lush tea estates, the swamp forest of Ratargul, and cascading waterfalls of the northeast hills.", highlights: ["Sreemangal tea gardens", "Ratargul swamp forest", "Jaflong riverside", "Seven Sisters waterfall"], itinerary: [
    { day: 1, title: "Bogura → Sreemangal", destination: "Sreemangal", activity: "Arrival, tea garden walks and sunset over the estates.", overnight: "Sreemangal resort", meals: "Dinner" },
    { day: 2, title: "Ratargul & Jaflong", destination: "Sylhet", activity: "Boat ride through Ratargul, Jaflong riverside, Bichnakandi.", overnight: "Sylhet", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return journey", destination: "Sylhet → Bogura", activity: "Tea breakfast, souvenirs, return.", overnight: "—", meals: "Breakfast" },
  ] });
  const t5 = mk({ slug: "sundarbans-expedition", title: "Sundarbans Expedition", subtitle: "Kingdom of the Bengal tiger", destSlug: "sundarbans", days: 3, nights: 2, price: 14000, discountPrice: null, difficulty: "Challenging", rating: 4.8, travelerCount: 85, category: "Adventure", description: "Sail into the world's largest mangrove forest. Watch for the Royal Bengal Tiger, spot deer and dolphins, and sleep aboard a cruise under the stars.", highlights: ["River cruise on the forest", "Tiger point & watchtowers", "Kotka & Jamtala beaches", "Deer & dolphin spotting"], itinerary: [
    { day: 1, title: "Bogura → Khulna → Boarding", destination: "Mongla", activity: "Travel to Mongla and board the cruise. Sunset on the river.", overnight: "Cruise", meals: "Dinner" },
    { day: 2, title: "Kotka & tiger point", destination: "Sundarbans East", activity: "Watchtower treks, Kotka beach, wildlife safari.", overnight: "Cruise", meals: "Breakfast, Lunch, Dinner" },
    { day: 3, title: "Return", destination: "Khulna → Bogura", activity: "Morning forest sail, disembark, return home.", overnight: "—", meals: "Breakfast" },
  ] });
  const t6 = mk({ slug: "rangamati-lakeside-tour", title: "Rangamati Lakeside Tour", subtitle: "Kaptai lake & hills", destSlug: "rangamati", days: 2, nights: 1, price: 5000, discountPrice: null, difficulty: "Easy", rating: 4.6, travelerCount: 120, category: "Nature", description: "A short and serene break beside Kaptai Lake — pedaling rafts, the hanging bridge and waterfall views.", highlights: ["Kaptai lake cruise", "Hanging bridge", "Shuvolong waterfall", "Pedaling raft"], itinerary: [
    { day: 1, title: "Bogura → Rangamati", destination: "Rangamati", activity: "Arrival, boat ride on Kaptai, hanging bridge and sunset.", overnight: "Lake resort", meals: "Dinner" },
    { day: 2, title: "Shuvolong & return", destination: "Rangamati → Bogura", activity: "Shuvolong waterfall, tribal market, return.", overnight: "—", meals: "Breakfast" },
  ] });
  const t7 = mk({ slug: "kuakata-beach-tour", title: "Kuakata Beach Tour", subtitle: "Beach of two suns", destSlug: "kuakata", days: 3, nights: 2, price: 7500, discountPrice: 6900, difficulty: "Easy", rating: 4.6, travelerCount: 90, category: "Beach", description: "Watch the sun rise and set over the Bay — Kuakata's rare twin-sun beach experience with Rakhine heritage.", highlights: ["Sunrise & sunset beaches", "Fatrar char", "Rakhine villages", "Misri Para"], itinerary: [
    { day: 1, title: "Bogura → Kuakata", destination: "Kuakata", activity: "Travel through Barishal, evening at the beach.", overnight: "Beach hotel", meals: "Dinner" },
    { day: 2, title: "Twin suns", destination: "Kuakata", activity: "Sunrise, Fatrar char boat trip, Rakhine village visit.", overnight: "Kuakata", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return", destination: "Kuakata → Bogura", activity: "Morning walk, ferry/road return.", overnight: "—", meals: "Breakfast" },
  ] });
  const t8 = mk({ slug: "chittagong-coastal-tour", title: "Chittagong Coastal Tour", subtitle: "Port city & coastal gems", destSlug: "chittagong", days: 3, nights: 2, price: 6500, discountPrice: null, difficulty: "Easy", rating: 4.5, travelerCount: 70, category: "Cultural", description: "A relaxed blend of city, hills and sea — a perfect base for the coastal routes of the south.", highlights: ["Foy's Lake", "Patenga beach", "CRB hills", "Bhatiary viewpoint"], itinerary: [
    { day: 1, title: "Bogura → Chittagong", destination: "Chittagong", activity: "Travel and city orientation. Sunset at Patenga.", overnight: "Chittagong hotel", meals: "Dinner" },
    { day: 2, title: "Foy's Lake & hills", destination: "Chittagong", activity: "Foy's Lake, CRB hilltop and local bazaars.", overnight: "Chittagong", meals: "Breakfast, Dinner" },
    { day: 3, title: "Return", destination: "Chittagong → Bogura", activity: "Morning leisure, return.", overnight: "—", meals: "Breakfast" },
  ] });
  const t9 = mk({ slug: "nepal-kathmandu-adventure", title: "Nepal Kathmandu Adventure", subtitle: "Stupas, prayer flags & peaks", destSlug: "nepal", days: 5, nights: 4, price: 55000, discountPrice: 52000, difficulty: "Moderate", rating: 4.9, travelerCount: 45, category: "International", departureCity: "Dhaka", description: "From Dhaka to Kathmandu — explore Boudhanath, Swayambhunath and Patan, with an optional Himalayan sightseeing flight.", highlights: ["Boudhanath stupa", "Swayambhunath", "Patan durbar", "Thamel bazaar", "Himalaya mountain flight (optional)"], images: [IMG.nepalStupa, IMG.nepalPatan, IMG.nepalBoudha, IMG.hikerSunrise], included: ["Dhaka–Kathmandu return airfare", "4 nights hotel", "Daily breakfast", "Local guide & transport", "Entry fees"], faq: [{ q: "Do I need a visa?", a: "A visa on arrival for Nepalese entry is generally available for Bangladeshi passport holders; please verify current rules before travel." }] });
  const t10 = mk({ slug: "thailand-bangkok-escape", title: "Thailand Bangkok Escape", subtitle: "Temples & city energy", destSlug: "thailand", days: 5, nights: 4, price: 62000, discountPrice: 58500, difficulty: "Easy", rating: 4.8, travelerCount: 60, category: "International", departureCity: "Dhaka", description: "Golden palaces, floating markets and rooftop nights — an unforgettable first taste of Southeast Asia.", highlights: ["Grand Palace", "Wat Pho", "Floating market", "Chatuchak shopping", "River cruise dinner"], images: [IMG.thailandPalace, IMG.thailandTemple, IMG.thailandEmerald, IMG.thailandWatPho], included: ["Dhaka–Bangkok return airfare", "4 nights hotel", "Daily breakfast", "Airport transfers", "Selected sightseeing"] });
  const t11 = mk({ slug: "custom-bangladesh-tour", title: "Custom Bangladesh Tour", subtitle: "Your journey, your way", destSlug: "bogura", days: 0, nights: 0, price: 0, discountPrice: null, difficulty: "Easy", rating: 5, travelerCount: 40, category: "Custom", description: "Tell us your dream — hills, beaches, forests or all of Bangladesh. Our team designs a private itinerary around your dates, budget and pace.", highlights: ["Fully custom itinerary", "Private or group travel", "Hotel & transport by you", "24/7 trip support"], featured: true });

  const allTours = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11];
  const toInsert = allTours.map((t) => ({
    id: t.id, slug: t.slug, title: t.title, subtitle: t.subtitle, destinationId: t.destinationId,
    category: t.category, description: t.description, highlights: t.highlights, durationDays: t.durationDays,
    durationNights: t.durationNights, price: t.price, discountPrice: t.discountPrice, departure: t.departureCity,
    departureCity: t.departureCity, difficulty: t.difficulty, groupSize: t.groupSize, rating: t.rating,
    travelerCount: t.travelerCount, included: t.included, excluded: t.excluded, itinerary: t.itinerary,
    images: t.images, lat: t.lat, lng: t.lng, faq: t.faq, cancellationPolicy: t.cancellationPolicy,
    requiredItems: t.requiredItems, shortDescription: t.subtitle, returnLocation: t.departureCity, currency: "BDT", status: "published" as const, published: true, featured: t.featured, isDemo: true,
  }));
  await db.insert(s.tours).values(toInsert);

  // upcoming tour dates
  const seatMap: Record<string, number> = {
    "bandarban-adventure": 7, "coxs-bazar-escape": 12, "sajek-valley-experience": 15,
    "sundarbans-expedition": 4, "thailand-bangkok-escape": 3,
  };
  const dateOffsets: Record<string, number[]> = {
    "bandarban-adventure": [14, 40], "coxs-bazar-escape": [20, 55], "sajek-valley-experience": [35, 75],
    "sylhet-nature-tour": [12, 60], "sundarbans-expedition": [45], "rangamati-lakeside-tour": [9, 30],
    "kuakata-beach-tour": [25], "nepal-kathmandu-adventure": [60], "thailand-bangkok-escape": [70],
  };
  const tdRows: { id: string; tourId: string; date: Date; seatsTotal: number; seatsBooked: number; status: "open" | "almost_full" | "full" | "cancelled" | "completed" }[] = [];
  for (const tour of allTours) {
    const offsets = dateOffsets[tour.slug];
    if (!offsets) continue;
    for (const off of offsets) {
      tdRows.push({
        id: uid(), tourId: tour.id, date: daysFromNow(off),
        seatsTotal: tour.slug === "nepal-kathmandu-adventure" ? 18 : 24,
        seatsBooked: seatMap[tour.slug] ?? 0, status: "open" as const,
      });
    }
  }
  await db.insert(s.tourDates).values(tdRows);

  // Blog posts
  const blogs: { slug: string; title: string; excerpt: string; content: string; cover: string; category: string; author: string; readingTime: string }[] = [
    { slug: "best-time-to-visit-bandarban", title: "Best Time to Visit Bandarban", excerpt: "Timing is everything when chasing cloud seas and green hills.", cover: IMG.greenHills, category: "Bangladesh Travel", author: "Shaibal Tours", readingTime: "4 min read", content: "Bandarban glows between October and March.\n\n**Why it matters**\nThe dry, cool months give the clearest hill views.\n\n**When to avoid**\nThe rainy season (June–September) can make hill roads slippery.\n\nPlan around festivals and weekends for quieter trails." },
    { slug: "cox-bazar-travel-guide", title: "The Ultimate Cox's Bazar Guide", excerpt: "Where to stay, what to eat and how to see the world's longest beach.", cover: IMG.coxBazarSunset, category: "Bangladesh Travel", author: "Shaibal Tours", readingTime: "6 min read", content: "Cox's Bazar stretches for about 120 km.\n\n**Top experiences**\nHimchari, Inani, sunrise and fresh seafood.\n\n**Getting around**\nEasily reached by road from Chittagong and Dhaka." },
    { slug: "packing-list-bangladesh-trek", title: "Smart Packing for a Bangladesh Trek", excerpt: "The essential kit for Sajek, Bandarban and the hill tracts.", cover: IMG.rockyTrail, category: "Travel Tips", author: "Shaibal Tours", readingTime: "3 min read", content: "Pack light but smart.\n\nBring sturdy shoes, layers, a power bank, medication and a water bottle. Rain gear helps in the hills." },
    { slug: "first-international-trip-from-bangladesh", title: "First International Trip From Bangladesh", excerpt: "Passports, visas and picking your first country abroad.", cover: IMG.nepalStupa, category: "International Travel", author: "Shaibal Tours", readingTime: "5 min read", content: "Your first trip abroad is a milestone.\n\nNepal, Thailand and Malaysia are popular first choices from Dhaka thanks to connectivity and budget-friendly packages." },
    { slug: "budget-travel-tips-bangladesh", title: "Travel More, Spend Smart", excerpt: "Real ways to enjoy Bangladesh without overspending.", cover: IMG.lakeBoats, category: "Budget Travel", author: "Shaibal Tours", readingTime: "4 min read", content: "Travel in a group to share costs.\n\nBook in the shoulder season, choose local stays and plan transport early." },
    { slug: "staying-safe-on-the-road", title: "Staying Safe on the Road", excerpt: "Sensible habits for smooth group journeys.", cover: IMG.coupleBalcony, category: "Travel Safety", author: "Shaibal Tours", readingTime: "3 min read", content: "Share your itinerary, keep emergency contacts handy and follow your guide's briefings." },
  ];
  await db.insert(s.blogPosts).values(blogs.map((b) => ({ id: uid(), ...b, published: true, isDemo: true })));

  // FAQs
  const faqRows = [
    { category: "Booking", question: "How do I book a tour?", answer: "Choose a tour, pick an available date, fill in traveler details and submit. Our team confirms your booking and shares the itinerary." },
    { category: "Payment", question: "What payment methods are accepted?", answer: "We are building support for bKash, Nagad and bank transfer. Payment is processed securely server-side." },
    { category: "Cancellation", question: "What is the cancellation policy?", answer: "Free cancellation up to 7 days before departure, 50% refund within 72 hours, and no refund for no-shows." },
    { category: "Hotels", question: "What kind of accommodation is included?", answer: "Standard tours include comfortable hotels or hillside cottages based on the package. Premium stays can be arranged." },
    { category: "Transport", question: "Is transport included?", answer: "Yes, most packages include AC transport with experienced drivers from Bogura." },
    { category: "International", question: "Do you handle visas and flights?", answer: "For international packages we assist with coordination. Visa requirements vary and should be verified before travel." },
    { category: "Booking", question: "Can I plan a fully custom trip?", answer: "Absolutely — use the Build Your Trip tool or contact us and we will design a private itinerary." },
  ];
  await db.insert(s.faqs).values(faqRows.map((f) => ({ id: uid(), ...f })));

  // Gallery
  const galleryRows = [
    { image: IMG.sajekRainbow, title: "Rainbow over Sajek", category: "Mountains", destination: "Sajek Valley" },
    { image: IMG.coxBazarSunset, title: "Golden hour at Cox's Bazar", category: "Beach", destination: "Cox's Bazar" },
    { image: IMG.teaGarden, title: "Rolling tea estates", category: "Nature", destination: "Sylhet" },
    { image: IMG.mangrove, title: "Into the Sundarbans", category: "Adventure", destination: "Sundarbans" },
    { image: IMG.nepalStupa, title: "Prayer flags in Kathmandu", category: "Culture", destination: "Nepal" },
    { image: IMG.thailandPalace, title: "Bangkok's golden palace", category: "Culture", destination: "Thailand" },
    { image: IMG.resortPool, title: "Unwinding by the pool", category: "Hotels", destination: "Cox's Bazar" },
    { image: IMG.coupleMountain, title: "Moments with a view", category: "Group Memories", destination: "Bandarban" },
    { image: IMG.cloudMountains, title: "Sea of clouds", category: "Mountains", destination: "Bandarban" },
    { image: IMG.lakeBoats, title: "Kaptai calm", category: "Nature", destination: "Rangamati" },
    { image: IMG.rockyTrail, title: "Trail to the summit", category: "Adventure", destination: "Nepal" },
    { image: IMG.coxBazar, title: "Boats at dawn", category: "Beach", destination: "Cox's Bazar" },
  ];
  await db.insert(s.galleryItems).values(galleryRows.map((g) => ({ id: uid(), ...g })));

  // Reviews
  const reviewRows = [
    { author: "Tanvir Hasan", tourSlug: "bandarban-adventure", rating: 5, title: "Flawless hills trip", content: "Everything was planned perfectly — transport, cottage and the Ridang sunrise were magical. Highly recommended!", date: "2025-11-10", status: "featured" as const },
    { author: "Farzana Islam", tourSlug: "coxs-bazar-escape", rating: 5, title: "Best family holiday", content: "Took my whole family. Our guide was patient and the seafood dinner by the beach was a highlight.", date: "2025-12-02", status: "featured" as const },
    { author: "Mehedi Rahman", tourSlug: "sajek-valley-experience", rating: 5, title: "Above the clouds", content: "Watching the sunrise over the cloud sea in Sajek is something I will never forget. Great coordination.", date: "2026-01-18", status: "featured" as const },
    { author: "Sadia Afrin", tourSlug: "nepal-kathmandu-adventure", rating: 5, title: "Seamless international trip", content: "Our first trip abroad and Shaibal made it effortless. Kathmandu was stunning.", date: "2025-09-25", status: "featured" as const },
    { author: "Ayon Chowdhury", tourSlug: "sylhet-nature-tour", rating: 4, title: "Peaceful and green", content: "Beautiful tea gardens and the Ratargul boat ride. Would love slightly more time at Jaflong.", date: "2025-08-14", status: "approved" as const },
    { author: "Nusrat Jahan", tourSlug: "sundarbans-expedition", rating: 5, title: "Wild and wonderful", content: "We saw deer, crocodiles and dolphins. The cruise felt safe and well-run.", date: "2025-12-20", status: "approved" as const },
  ];
  const revTourBySlug = new Map(allTours.map((t) => [t.slug, t.id]));
  await db.insert(s.reviews).values(
    reviewRows.map((r) => ({
      id: uid(), userId: CUST_ID, author: r.author, tourId: revTourBySlug.get(r.tourSlug), rating: r.rating,
      title: r.title, content: r.content, travelDate: r.date, photos: [], status: r.status,
    })),
  );

  // One demo booking with live trip progress
  const booking = uid();
  const progressSteps: s.ProgressStep[] = [
    { id: "p1", label: "Planning", status: "completed", detail: "Itinerary confirmed" },
    { id: "p2", label: "Booking", status: "completed", detail: "Booking confirmed" },
    { id: "p3", label: "Departure", status: "completed", detail: "Departed Bogura 6:00 AM" },
    { id: "p4", label: "Destination Activities", status: "completed", detail: "Day 4 — Cox's Bazar" },
    { id: "p5", label: "Return Journey", status: "upcoming", detail: "Bus scheduled 8:30 PM" },
    { id: "p6", label: "Completed", status: "upcoming" },
  ];
  await db.insert(s.bookings).values({
    id: booking, bookingCode: "STL-2026-0001", tourId: t1.id, tourTitle: t1.title,
    userId: CUST_ID, contactName: "Rahim Ahmed", contactPhone: "+8801711111111", contactEmail: "demo@shaibaltours.com",
    emergencyName: "Karim Ahmed", emergencyPhone: "+8801712222222", date: daysFromNow(-2),
    travelers: [{ name: "Rahim Ahmed", age: "30", gender: "Male" }, { name: "Faria Ahmed", age: "28", gender: "Female" }],
    total: 15800, paidAmount: 10000, status: "confirmed", progress: 66, progressJson: progressSteps, createdBy: "public",
  });
  await db.insert(s.payments).values({
    id: uid(), bookingId: booking, amount: 10000, method: "online", gateway: "bKash",
    transactionId: "BK-DEMO-8891", status: "confirmed", paidBy: "Rahim Ahmed",
  });

  // Demo trip group + participants + expenses
  const trip = uid();
  await db.insert(s.trips).values({
    id: trip, tourId: t1.id, name: "Bandarban Adventure — Feb Group",
    route: ["Bogura", "Chittagong", "Bandarban", "Nilgiri", "Thanchi", "Cox's Bazar", "Bogura"],
    startDate: daysFromNow(-2), endDate: daysFromNow(2), revenue: 120000, status: "in-progress",
  });
  const partNames = ["Rahim Ahmed", "Faria Ahmed", "Tanvir Hasan", "Nusrat Jahan", "Mehedi Rahman", "Sadia Afrin"];
  await db.insert(s.participants).values(
    partNames.map((name, i) => ({
      id: uid(), tripId: trip, name, phone: `+88017${10000000 + i}`, email: `demo${i}@example.com`,
      age: 25 + i, gender: i % 2 ? "Female" : "Male", paymentStatus: "paid", seat: `S${i + 1}`,
      room: i % 2 ? "R2B" : "R1A", special: "",
    })),
  );
  const expenseData: { category: string; title: string; description: string; amount: number; paidBy: string }[] = [
    { category: "Transport", title: "Bus hire (3 days)", description: "AC HiAce, Bogura–Bandarban–Cox", amount: 18000, paidBy: "Operator" },
    { category: "Hotel", title: "Cottage nights", description: "Hillside cottage 2 nights", amount: 12000, paidBy: "Operator" },
    { category: "Food", title: "Meals & BBQ", description: "Group meals across days", amount: 9000, paidBy: "Guide" },
    { category: "Guide", title: "Local guide fee", description: "3-day guide", amount: 6000, paidBy: "Operator" },
    { category: "Tickets", title: "Entry fees", description: "Nilgiri, Boga lake & viewpoints", amount: 4500, paidBy: "Operator" },
    { category: "Fuel", title: "Diesel", description: "Fuel top-up at Chittagong", amount: 4000, paidBy: "Driver" },
  ];
  await db.insert(s.tripExpenses).values(
    expenseData.map((e) => ({ id: uid(), tripId: trip, category: e.category, title: e.title, description: e.description, amount: e.amount, paidBy: e.paidBy, method: "Cash", date: daysFromNow(-1) })),
  );

  // settings
  await db.insert(s.settings).values([
    { key: "site", value: { brand: "Shaibal Tours & Travels", tagline: "Explore More. Travel Better. Create Memories." } },
    { key: "announcement", value: { text: "Now booking: Bandarban Adventure & Cox's Bazar Escape for the coming weeks." } },
  ]);

  console.log("Seeded demo data successfully. (demo content — never run against production)");
  console.log("Admin login   : admin@shaibaltours.com / shaibal123");
  console.log("Customer login: demo@shaibaltours.com / shaibal123");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
