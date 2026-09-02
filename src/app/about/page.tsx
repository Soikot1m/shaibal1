import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/ui";
import { Reveal, SectionShell } from "@/components/motion";
import { IMG } from "@/lib/images";
import { ShieldCheck, Eye, Heart, Users, MapPin, Award } from "lucide-react";

export const metadata = { title: "About Us", description: "Shaibal Tours & Travels — a premium, traveler-first tour operator based in Bogura, Bangladesh." };

const values = [
  { icon: Award, t: "Professionalism", d: "Organised itineraries, punctual coordination and clear communication at every step." },
  { icon: ShieldCheck, t: "Safety", d: "Trusted drivers, vetted accommodation and emergency-ready planning." },
  { icon: Eye, t: "Transparency", d: "Honest pricing with no hidden charges — you always know what's included." },
  { icon: Heart, t: "Customer satisfaction", d: "We measure success by the memories our travelers take home." },
  { icon: MapPin, t: "Local expertise", d: "Deep knowledge of Bangladesh's hills, beaches, forests and culture." },
  { icon: Users, t: "Community", d: "We travel responsibly and support local guides, cottages and artisans." },
];

const timeline = [
  { y: "Beginning", t: "Founded in Bogura", d: "Started with weekend trips for friends and families across northern Bangladesh." },
  { y: "Growth", t: "Hills & coast", d: "Signature routes to Bandarban, Sajek and Cox's Bazar became traveler favourites." },
  { y: "Expansion", t: "Beyond borders", d: "Added international escapes to Nepal, India, Thailand and Malaysia." },
  { y: "Today", t: "Travel technology", d: "Digital booking, live trip tracking and transparent accounting for every group." },
];

const team = [
  { n: "[Founder Name]", r: "Founder & Tour Director" },
  { n: "[Operations Lead]", r: "Operations & Logistics" },
  { n: "[Guide Lead]", r: "Senior Tour Guide" },
  { n: "[Support Lead]", r: "Customer Experience" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[60vh] min-h-[420px] flex items-end">
        <img src={IMG.coupleMountain} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-x relative pb-12 text-white">
          <p className="chip !bg-white/15 !text-white mb-3">Who we are</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl max-w-3xl">A Bogura travel company built around people, not packages.</h1>
        </div>
      </section>

      <SectionShell>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="flex items-center gap-4 mb-5">
              <Image src="/logo.png" alt="Shaibal Tours logo" width={64} height={64} className="rounded-[26%] shadow-float" />
              <div><p className="font-display font-extrabold text-2xl leading-none">Shaibal Tours &amp; Travels</p><p className="text-sm text-muted mt-1">Bogura, Bangladesh</p></div>
            </div>
            <h2 className="font-display font-extrabold text-3xl">Our mission</h2>
            <p className="text-muted mt-3 leading-relaxed">To make premium, well-coordinated travel accessible to solo travelers, couples, families, students and corporate groups — turning every journey into a memory worth keeping.</p>
            <h2 className="font-display font-extrabold text-3xl mt-8">Our vision</h2>
            <p className="text-muted mt-3 leading-relaxed">To be the most trusted travel partner in northern Bangladesh — combining local expertise with modern travel technology, transparency and heartfelt hospitality.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              <img src={IMG.sajekRainbow} alt="Sajek" className="rounded-3xl h-56 w-full object-cover" />
              <img src={IMG.coxBazarSunset} alt="Cox's Bazar" className="rounded-3xl h-56 w-full object-cover mt-8" />
              <img src={IMG.teaGarden} alt="Sylhet" className="rounded-3xl h-56 w-full object-cover" />
              <img src={IMG.nepalStupa} alt="Nepal" className="rounded-3xl h-56 w-full object-cover mt-8" />
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell className="bg-white/40 dark:bg-white/[0.02]">
        <SectionHeading align="center" eyebrow="Our values" title="Why travelers trust us" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.05}><div className="card p-6 h-full"><v.icon className="h-6 w-6 text-sky-500 mb-3" /><h3 className="font-display font-bold text-lg">{v.t}</h3><p className="text-sm text-muted mt-1.5">{v.d}</p></div></Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeading align="center" eyebrow="Our journey" title="How we got here" />
        <ol className="relative border-l-2 border-sky-200 dark:border-sky-800 ml-3 space-y-8">
          {timeline.map((t, i) => (
            <Reveal key={t.t} delay={i * 0.08}>
              <li className="pl-8 relative">
                <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full gradient-brand ring-4 ring-white dark:ring-navy-900" />
                <span className="chip !text-xs">{t.y}</span>
                <h3 className="font-display font-bold text-xl mt-2">{t.t}</h3>
                <p className="text-sm text-muted mt-1">{t.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </SectionShell>

      <SectionShell className="bg-white/40 dark:bg-white/[0.02]">
        <SectionHeading align="center" eyebrow="Our team" title="The people behind your trips" sub="Team profiles are editable from the admin settings." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((m) => (
            <div key={m.r} className="card p-6 text-center"><div className="mx-auto h-20 w-20 rounded-full gradient-brand grid place-items-center text-white font-display font-bold text-2xl">{m.r[0]}</div><p className="font-semibold mt-4">{m.n}</p><p className="text-xs text-muted">{m.r}</p></div>
          ))}
        </div>
        <div className="text-center mt-10"><Link href="/contact" className="btn btn-primary btn-lg">Talk to our team</Link></div>
      </SectionShell>
    </div>
  );
}
