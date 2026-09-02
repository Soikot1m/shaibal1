"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Item = { id: number; message: string; title?: string; type: string };

const iconFor: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-rose-500" />,
  warning: <TriangleAlert className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
};

export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev.slice(-3), { id, message: d.message, title: d.title, type: d.type || "success" }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4200);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);
  return (
    <div className="fixed bottom-20 right-3 sm:right-6 z-[100] flex flex-col gap-2 sm:bottom-6 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      <AnimatePresence>
        {items.map((i) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="glass-strong rounded-2xl p-3.5 pr-10 shadow-card flex gap-3 relative"
            role="status"
          >
            {iconFor[i.type]}
            <div className="min-w-0">
              {i.title && <p className="text-sm font-bold">{i.title}</p>}
              <p className="text-sm text-muted">{i.message}</p>
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
