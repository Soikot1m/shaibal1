"use client";
import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Item = { id: string; image: string; title: string | null; category: string | null; destination: string | null };

export function GalleryGrid({ items }: { items: Item[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category || "Other")))], [items]);
  const dests = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.destination || "Other")))], [items]);
  const [cat, setCat] = useState("All");
  const [dest, setDest] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => (cat === "All" || i.category === cat) && (dest === "All" || i.destination === dest));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, list.length]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-active" : ""}`}>{c}</button>)}</div>
      <div className="flex flex-wrap gap-2 mb-8">{dests.map((d) => <button key={d} onClick={() => setDest(d)} className={`chip !bg-transparent ${dest === d ? "!border-sky-500 !text-sky-600" : "!text-muted"}`}>{d}</button>)}</div>

      <div className="grid-masonry">
        {list.map((g, i) => (
          <motion.button
            key={g.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setOpen(i)}
            className="relative w-full overflow-hidden rounded-2xl group text-left"
            aria-label={`Open ${g.title || "photo"}`}
          >
            <img src={g.image} alt={g.title || ""} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-110" style={{ height: 180 + ((i * 53) % 140) }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end text-white">
              <p className="font-semibold text-sm">{g.title}</p>
              <p className="text-xs text-white/80">{g.destination}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-navy-900/95 backdrop-blur flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
            <button className="absolute top-4 right-4 text-white grid place-items-center h-11 w-11 rounded-full bg-white/10" aria-label="Close" onClick={() => setOpen(null)}><X className="h-6 w-6" /></button>
            <button className="absolute left-3 text-white grid place-items-center h-11 w-11 rounded-full bg-white/10" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }}><ChevronLeft className="h-6 w-6" /></button>
            <button className="absolute right-3 text-white grid place-items-center h-11 w-11 rounded-full bg-white/10" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }}><ChevronRight className="h-6 w-6" /></button>
            <motion.figure key={list[open].id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={list[open].image.replace("w=1200&h=800", "w=1600&h=1067")} alt={list[open].title || ""} className="w-full max-h-[78vh] object-contain rounded-2xl" />
              <figcaption className="text-white text-center mt-3"><p className="font-semibold">{list[open].title}</p><p className="text-xs text-white/70">{list[open].destination} · {list[open].category}</p></figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
