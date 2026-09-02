import { Phone, MessageCircle, Mail, MapPin, Clock, Share2, Camera } from "lucide-react";
import { getSiteSettings } from "@/lib/content";
import { getFaqs } from "@/lib/data";
import { SectionHeading } from "@/components/ui";
import { ContactForm, CustomTripForm, TicketForm } from "@/components/contact-forms";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = { title: "Contact Us", description: "Contact Shaibal Tours & Travels in Bogura, Bangladesh — phone, WhatsApp, email, custom tour requests and support." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; destination?: string }> }) {
  const sp = await searchParams;
  const [s, faqs] = await Promise.all([getSiteSettings(), getFaqs()]);
  const items = [
    { icon: Phone, l: "Phone", v: s.phone, href: s.phone.startsWith("[") ? undefined : `tel:${s.phone}` },
    { icon: MessageCircle, l: "WhatsApp", v: s.whatsapp, href: s.whatsapp.startsWith("[") ? undefined : `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` },
    { icon: Mail, l: "Email", v: s.email, href: s.email.startsWith("[") ? undefined : `mailto:${s.email}` },
    { icon: MapPin, l: "Office", v: s.address },
    { icon: Clock, l: "Business hours", v: s.hours },
  ];
  const faqItems = faqs.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <div className="container-x pt-28 pb-16">
      <SectionHeading align="center" eyebrow="Get in touch" title={<>We're here to help you <em>travel better</em></>} sub="Questions about a tour, dates or pricing? Want a fully custom trip? Reach us any way you like." />

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display font-extrabold text-xl">Shaibal Tours &amp; Travels</h2>
            <p className="text-sm text-muted">Bogura, Bangladesh</p>
            <ul className="mt-5 space-y-3 text-sm">
              {items.map((it) => (
                <li key={it.l} className="flex gap-3">
                  <span className="grid place-items-center h-9 w-9 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 shrink-0"><it.icon className="h-4 w-4" /></span>
                  <div><p className="text-xs text-muted">{it.l}</p>{it.href ? <a href={it.href} className="font-semibold hover:text-sky-600">{it.v}</a> : <p className="font-semibold">{it.v}</p>}</div>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-5">
              <a href={s.facebook} className="btn btn-soft btn-sm"><Share2 className="h-4 w-4" /> Facebook</a>
              <a href={s.instagram} className="btn btn-soft btn-sm"><Camera className="h-4 w-4" /> Instagram</a>
            </div>
            <p className="text-[0.68rem] text-muted mt-4">Bracketed values are placeholders — set real contact details in Admin → Settings.</p>
          </div>
          <div className="card overflow-hidden">
            <iframe title="Bogura, Bangladesh map" src="https://www.openstreetmap.org/export/embed.html?bbox=89.30%2C24.80%2C89.44%2C24.90&layer=mapnik&marker=24.85%2C89.37" className="w-full h-56 border-0" loading="lazy" />
          </div>
        </aside>

        <div className="space-y-6">
          <section className="card p-6 sm:p-8" id="custom">
            <h2 className="font-display font-bold text-2xl mb-1">Build your trip</h2>
            <p className="text-sm text-muted mb-5">Tell us where, when and how — see a live estimate and request a custom tour.</p>
            <CustomTripForm defaultDestination={sp.destination || ""} />
          </section>
          <div className="grid md:grid-cols-2 gap-6">
            <section className="card p-6" id="message"><h2 className="font-display font-bold text-xl mb-4">Send a message</h2><ContactForm /></section>
            <section className="card p-6" id="support"><h2 className="font-display font-bold text-xl mb-4">Support ticket</h2><TicketForm /></section>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-3xl mx-auto">
        <SectionHeading align="center" eyebrow="Help center" title="Frequently asked questions" />
        <FaqAccordion items={faqItems} />
      </section>
    </div>
  );
}
