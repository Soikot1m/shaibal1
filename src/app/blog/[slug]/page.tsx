import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { ShareButton } from "@/components/booking-widgets";
import { Clock, ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getBlogPostBySlug(slug);
  return { title: p?.title || "Article", description: p?.excerpt || undefined, openGraph: p?.cover ? { images: [p.cover] } : undefined };
}

function renderContent(md: string) {
  return md.split(/\n\n+/).map((block, i) => {
    const bold = block.match(/^\*\*(.+)\*\*$/);
    if (bold) return <h3 key={i} className="font-display font-bold text-xl mt-8 mb-2">{bold[1]}</h3>;
    return <p key={i} className="text-muted leading-relaxed mb-4">{block.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.published) notFound();
  const related = (await getBlogPosts(6)).filter((p) => p.id !== post.id).slice(0, 3);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.createdAt, author: { "@type": "Organization", name: post.author }, image: post.cover };

  return (
    <article className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative h-[56vh] min-h-[380px] flex items-end">
        <img src={post.cover || ""} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="container-x relative pb-10 text-white max-w-3xl">
          <Link href="/blog" className="chip !bg-white/15 !text-white mb-4"><ArrowLeft className="h-3 w-3" /> All guides</Link>
          <span className="block text-sky-200 text-xs font-bold uppercase tracking-[0.2em]">{post.category}</span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl mt-2">{post.title}</h1>
          <p className="mt-3 text-white/80 text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> {post.readingTime} · {formatDate(post.createdAt)} · {post.author}</p>
        </div>
      </section>
      <div className="container-x max-w-3xl pt-10">
        {post.excerpt && <p className="text-lg font-medium leading-relaxed mb-6">{post.excerpt}</p>}
        {renderContent(post.content)}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-line items-center">
          <span className="text-sm text-muted mr-2">Share:</span>
          <ShareButton url={`${base}/blog/${post.slug}`} title={post.title} />
          <a className="btn btn-ghost btn-sm" href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + base + "/blog/" + post.slug)}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="btn btn-ghost btn-sm" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(base + "/blog/" + post.slug)}`} target="_blank" rel="noreferrer">Facebook</a>
        </div>
      </div>
      {related.length > 0 && (
        <div className="container-x mt-14">
          <h2 className="font-display font-bold text-2xl mb-5">Related guides</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="card overflow-hidden group hover:shadow-float transition">
                <img src={r.cover || ""} alt={r.title} loading="lazy" className="h-36 w-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="p-4"><h3 className="font-semibold group-hover:text-sky-600">{r.title}</h3><p className="text-xs text-muted mt-1">{r.readingTime}</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
