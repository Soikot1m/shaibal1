import { getGallery } from "@/lib/data";
import { GalleryGrid } from "@/components/gallery-grid";
import { SectionHeading } from "@/components/ui";

export const metadata = { title: "Photo Gallery", description: "Cinematic moments from Shaibal Tours & Travels journeys across Bangladesh and beyond." };

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <div className="container-x pt-28 pb-16">
      <SectionHeading align="center" eyebrow="Gallery" title={<>Moments we helped <em>create</em></>} sub="Mountains, beaches, culture and group memories — filter by category or destination and open any photo in the lightbox." />
      <GalleryGrid items={items} />
      <section className="mt-16">
        <SectionHeading eyebrow="Video" title="Travel films" className="!mb-5" />
        <div className="grid md:grid-cols-2 gap-5">
          {["dQw4w9WgXcQ", "ysz5S6PUM-U"].map((id, i) => (
            <div key={id} className="card overflow-hidden aspect-video">
              <iframe
                className="w-full h-full"
                loading="lazy"
                src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&mute=1`}
                title={i === 0 ? "Shaibal Tours highlight film (placeholder)" : "Traveler memories (placeholder)"}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">Placeholder embeds — replace with your YouTube/Vimeo/MP4 links from the admin content settings.</p>
      </section>
    </div>
  );
}
