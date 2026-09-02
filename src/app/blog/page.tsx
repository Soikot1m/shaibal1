import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

export const metadata = { title: "Travel Guides & Blog", description: "Travel tips, Bangladesh guides, budget travel and safety advice from Shaibal Tours & Travels." };

const CATS = ["All", "Travel Tips", "Bangladesh Travel", "International Travel", "Budget Travel", "Adventure", "Hotels", "Food", "Travel Safety"];

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "All" } = await searchParams;
  const posts = (await getBlogPosts(50)).filter((p) => category === "All" || p.category === category);
  const [lead, ...rest] = posts;

  return (
    <div className="container-x pt-28 pb-16">
      <SectionHeading align="center" eyebrow="Travel guides" title={<>Stories, tips and <em>inspiration</em></>} sub="Practical guides written from the road to help you plan better trips." />
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATS.map((c) => <Link key={c} href={c === "All" ? "/blog" : `/blog?category=${encodeURIComponent(c)}`} className={`chip ${category === c ? "chip-active" : ""}`}>{c}</Link>)}
      </div>

      {!lead ? (
        <div className="card p-14 text-center text-muted">No articles in this category yet.</div>
      ) : (
        <>
          <Link href={`/blog/${lead.slug}`} className="card overflow-hidden grid md:grid-cols-2 group hover:shadow-float transition mb-8">
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden"><img src={lead.cover || ""} alt={lead.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" /></div>
            <div className="p-7 flex flex-col justify-center">
              <span className="chip w-fit">{lead.category}</span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-3 group-hover:text-sky-600">{lead.title}</h2>
              <p className="text-muted mt-3">{lead.excerpt}</p>
              <p className="text-xs text-muted mt-5 flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {lead.readingTime} · {formatDate(lead.createdAt)} · {lead.author}</p>
            </div>
          </Link>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((b, i) => (
              <Reveal key={b.id} delay={(i % 3) * 0.05}>
                <Link href={`/blog/${b.slug}`} className="card overflow-hidden h-full block group hover:shadow-float transition">
                  <div className="aspect-[16/10] overflow-hidden"><img src={b.cover || ""} alt={b.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-700" /></div>
                  <div className="p-5">
                    <span className="chip !text-xs">{b.category}</span>
                    <h3 className="font-display font-bold mt-2 leading-snug group-hover:text-sky-600">{b.title}</h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2">{b.excerpt}</p>
                    <p className="text-xs text-muted mt-3">{b.readingTime} · {formatDate(b.createdAt)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
