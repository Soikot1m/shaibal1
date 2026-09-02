"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (path.startsWith("/admin")) return null;
  return (
    <div className="fixed z-40 right-4 bottom-[76px] lg:bottom-6 flex flex-col items-end gap-2 print:hidden">
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="grid place-items-center h-10 w-10 rounded-full bg-panel border border-line shadow-card text-fg hover:border-fg transition">
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
      <a href="tel:+8800000000000" aria-label="Call us" className="grid place-items-center h-11 w-11 rounded-full bg-fg text-paper shadow-float hover:bg-accent hover:text-white transition">
        <Phone className="h-[18px] w-[18px]" />
      </a>
      <a href="https://wa.me/8800000000000" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="grid place-items-center h-12 w-12 rounded-full bg-[#25D366] text-white shadow-float hover:brightness-95 transition">
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}
