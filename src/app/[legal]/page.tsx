import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

const PAGES: Record<string, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "This policy explains how [Brand] collects, uses and protects your personal information when you use our website and services.",
    sections: [
      { h: "Information we collect", p: "Contact details (name, phone, email), traveler details required for bookings, emergency contacts, payment references and support messages you send us." },
      { h: "How we use it", p: "To process bookings, coordinate trips, send trip updates and reminders, respond to enquiries and improve our services. We do not sell personal data." },
      { h: "Storage & security", p: "Data is stored in a secured database with access limited to authorised staff. Payment credentials are handled by payment gateways and never stored by us." },
      { h: "Your rights", p: "You may request a copy, correction or deletion of your data by contacting [Business Email]." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "By booking with [Brand] you agree to the following terms.",
    sections: [
      { h: "Bookings", p: "A booking is confirmed once we acknowledge it and the required deposit is received. Prices are per person unless stated otherwise." },
      { h: "Traveler responsibilities", p: "Travelers must carry valid identification (NID/passport), follow guide instructions and respect local laws and customs." },
      { h: "Changes by us", p: "Itineraries may change due to weather, safety or operational reasons. We will offer reasonable alternatives where possible." },
      { h: "Liability", p: "We act as a coordinator with transport, hotel and activity providers and are not liable for losses arising from events beyond our control." },
    ],
  },
  "refund-policy": {
    title: "Refund Policy",
    intro: "Refunds are processed according to the schedule below and returned to the original payment method within 7–14 business days.",
    sections: [
      { h: "Eligible refunds", p: "Cancellations made within the free-cancellation window receive a full refund of amounts paid, minus any non-refundable third-party costs." },
      { h: "Partial refunds", p: "Cancellations within 72 hours of departure receive 50% of the package price." },
      { h: "Non-refundable", p: "No-shows, unused services and international airfare/visa fees are non-refundable." },
    ],
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    intro: "We understand plans change. Here is how cancellations work.",
    sections: [
      { h: "7+ days before departure", p: "Free cancellation — full refund of amounts paid." },
      { h: "Within 72 hours", p: "50% refund of the package price." },
      { h: "No-show", p: "No refund." },
      { h: "Cancellation by us", p: "If we cancel a departure (e.g. minimum group size not met or safety concerns), you receive a full refund or a free transfer to another date." },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    intro: "We use cookies to keep the website working and, with your consent, to understand how it is used.",
    sections: [
      { h: "Essential cookies", p: "Used for login sessions, security and remembering your theme preference. These cannot be switched off." },
      { h: "Analytics & marketing", p: "Loaded only after you accept them in the consent banner. You can change your choice anytime by clearing site data." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  return { title: PAGES[legal]?.title || "Not found" };
}

export default async function LegalPage({ params }: { params: Promise<{ legal: string }> }) {
  const { legal } = await params;
  const page = PAGES[legal];
  if (!page) notFound();
  const s = await getSiteSettings();
  const fill = (t: string) => t.replace(/\[Brand\]/g, s.brand).replace(/\[Business Email\]/g, s.email);
  return (
    <div className="container-x pt-28 pb-16 max-w-3xl">
      <p className="chip mb-3">Legal</p>
      <h1 className="font-display font-extrabold text-4xl">{page.title}</h1>
      <p className="text-muted mt-3 text-lg">{fill(page.intro)}</p>
      <div className="mt-8 space-y-6">{page.sections.map((sec) => <section key={sec.h} className="card p-6"><h2 className="font-display font-bold text-xl">{sec.h}</h2><p className="text-muted mt-2">{fill(sec.p)}</p></section>)}</div>
      <p className="text-xs text-muted mt-8">Last updated {new Date().getFullYear()}. This is editable placeholder text — replace with your reviewed legal copy. Questions? <Link href="/contact" className="underline">Contact us</Link>.</p>
    </div>
  );
}
