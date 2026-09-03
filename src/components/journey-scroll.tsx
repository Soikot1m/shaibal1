"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Mountain, Waves, Building2, Trees, Navigation } from "lucide-react";

/* ───────────────────────────────────────────────────────────────
   Capability detection — three tiers, never blocks the page.
   ─────────────────────────────────────────────────────────────── */
type Tier = "high" | "balanced" | "lite";

function detectTier(): Tier {
  if (typeof window === "undefined") return "lite";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "lite";
  const cores = navigator.hardwareConcurrency ?? 2;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores >= 8 && mem >= 8 && !coarse) return "high";
  if (cores >= 4) return "balanced";
  return "lite";
}

/** True when WebGL is genuinely available (checked once, cached). */
function webglOk(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export const JOURNEY_STOPS = [
  { key: "bogura", name: "Bogura", tag: "Departure", note: "Our home base in the northern plains — the journey begins before sunrise.", tint: "#c9a86a", icon: Building2, day: "Day 1 · 05:30" },
  { key: "chittagong", name: "Chittagong", tag: "Transit", note: "The port city. A stop for breakfast as the landscape turns coastal.", tint: "#7fa9a4", icon: Navigation, day: "Day 1 · Midday" },
  { key: "bandarban", name: "Bandarban", tag: "The Hills", note: "Green ridges, mist and tribal villages high in the Chittagong Hill Tracts.", tint: "#5f8f7a", icon: Mountain, day: "Day 2" },
  { key: "lama", name: "Lama", tag: "The Valley", note: "A quiet valley of rivers and bamboo groves — the least visited leg of the route.", tint: "#4f8f6f", icon: Trees, day: "Day 3" },
  { key: "coxs-bazar", name: "Cox's Bazar", tag: "The Coast", note: "120 km of sand. The horizon finally opens up at the Bay of Bengal.", tint: "#3f8fa8", icon: Waves, day: "Day 4" },
  { key: "dhaka", name: "Dhaka", tag: "Return", note: "Back through the capital, carrying four days of stories.", tint: "#a8845f", icon: Building2, day: "Day 5" },
];

/* ───────────────────────────────────────────────────────────────
   Layered 2.5D canvas — parallax mountains, route line, moving
   vehicle marker. GPU-cheap: one canvas, no WebGL required.
   ─────────────────────────────────────────────────────────────── */
function JourneyCanvas({ tier, progress }: { tier: Tier; progress: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prog = useRef(progress);
  prog.current = progress;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layerCount = tier === "high" ? 4 : tier === "balanced" ? 3 : 2;
    const birdCount = tier === "high" ? 5 : tier === "balanced" ? 3 : 0;
    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === "high" ? 2 : 1.5);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ridge = (baseY: number, amp: number, seed: number, colour: string) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const n =
          Math.sin((x + seed * 120) * 0.004) * amp +
          Math.sin((x + seed * 60) * 0.011) * amp * 0.45 +
          Math.sin((x + seed * 30) * 0.023) * amp * 0.2;
        ctx.lineTo(x, baseY - n);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = colour;
      ctx.fill();
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const p = prog.current;
      t += 1;

      // Sky: shifts from warm plains to deep coastal blue as the journey advances.
      const g = ctx.createLinearGradient(0, 0, 0, h);
      const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
      const top = mix([236, 214, 178], [24, 58, 82], p);
      const mid = mix([244, 226, 200], [46, 96, 116], p);
      g.addColorStop(0, `rgb(${top.join(",")})`);
      g.addColorStop(0.55, `rgb(${mid.join(",")})`);
      g.addColorStop(1, "rgba(11,16,23,0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Sun / moon travelling across
      const sx = w * (0.15 + p * 0.7);
      const sy = h * (0.42 - p * 0.16);
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 90);
      sg.addColorStop(0, "rgba(255,246,214,0.85)");
      sg.addColorStop(1, "rgba(255,246,214,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 95, sy - 95, 190, 190);

      // Distant ridges (parallax by depth)
      const palette = ["rgba(30,62,74,0.55)", "rgba(38,82,88,0.7)", "rgba(28,66,66,0.85)", "rgba(18,44,48,0.95)"];
      for (let i = 0; i < layerCount; i++) {
        const depth = i / Math.max(1, layerCount - 1);
        const amp = (tier === "lite" ? 26 : 40) * (1 - depth * 0.35) + p * 14;
        ridge(h * (0.5 + depth * 0.16), amp, i + 1, palette[i % palette.length]);
      }

      // Animated route line with travelled/untravelled split
      const ry = h * 0.78;
      ctx.setLineDash([9, 9]);
      ctx.lineDashOffset = -t * 0.35;
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.lineTo(w, ry);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(234,217,177,0.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.lineTo(w * p, ry);
      ctx.stroke();

      // Travelling marker
      const mx = w * p;
      ctx.beginPath();
      ctx.arc(mx, ry, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#ead9b1";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, ry, 16 + Math.sin(t * 0.08) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(234,217,177,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Birds (high tier only)
      if (birdCount) {
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < birdCount; i++) {
          const bx = ((t * (0.35 + i * 0.07) + i * 260) % (w + 120)) - 60;
          const by = h * (0.2 + i * 0.045) + Math.sin(t * 0.03 + i) * 7;
          const flap = Math.sin(t * 0.16 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(bx - 7, by + flap);
          ctx.quadraticCurveTo(bx, by - 4, bx + 7, by + flap);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [tier]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

/* ───────────────────────────────────────────────────────────────
   The section. Scroll drives progress; the canvas and cards respond.
   ─────────────────────────────────────────────────────────────── */
export function JourneyScroll() {
  const [tier, setTier] = useState<Tier>("lite");
  const [webgl, setWebgl] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const t = detectTier();
    setTier(t);
    setWebgl(t === "high" && webglOk());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      const raw = total > 0 ? (-r.top) / total : 0;
      const p = Math.min(1, Math.max(0, raw));
      setProgress(p);
      setActive(Math.min(JOURNEY_STOPS.length - 1, Math.floor(p * JOURNEY_STOPS.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stop = JOURNEY_STOPS[active];

  return (
    <section id="journey" ref={wrapRef} className="relative" style={{ height: `${JOURNEY_STOPS.length * 78}vh` }} aria-label="Your journey starts here — Bogura to Cox's Bazar">
      {/* sticky viewport */}
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-navy-900">
        {!reduced && <JourneyCanvas tier={tier} progress={progress} />}
        {reduced && <div className="absolute inset-0 bg-gradient-to-b from-[#ecd6b2] to-navy-900" aria-hidden />}

        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/45 via-transparent to-navy-900/85" />

        <div className="relative h-full container-x flex flex-col justify-center py-24">
          {/* heading */}
          <div className="max-w-2xl">
            <p className="eyebrow !text-sand-200 mb-4">
              <span className="eyebrow-index !text-white/45">03</span> Your journey starts here
            </p>
            <h2 className="text-white text-[2.2rem] sm:text-[3.2rem] lg:text-[3.8rem]">
              Bogura to the Bay, <em className="!text-sand-200">scroll by scroll.</em>
            </h2>
            <p className="mt-5 text-white/70 text-[1.05rem] max-w-lg">
              Five days, six stops, one road. This is the route our travellers take through the hills and down to the longest beach on earth.
            </p>
          </div>

          {/* active stop card */}
          <div className="mt-10 max-w-xl">
            <div className="glass rounded-2xl p-6 sm:p-7 !border-white/15">
              <div className="flex items-start gap-4">
                <span className="grid place-items-center h-12 w-12 rounded-xl shrink-0" style={{ background: `${stop.tint}33`, border: `1px solid ${stop.tint}66` }}>
                  <stop.icon className="h-6 w-6" style={{ color: stop.tint }} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.64rem] uppercase tracking-[0.18em] text-white/50">
                    Stop {active + 1} of {JOURNEY_STOPS.length} · {stop.day}
                  </p>
                  <h3 className="font-display text-white text-[1.75rem] leading-tight mt-1">{stop.name}</h3>
                  <p className="text-[0.7rem] uppercase tracking-[0.14em] mt-1" style={{ color: stop.tint }}>{stop.tag}</p>
                  <p className="text-white/75 text-sm mt-3 leading-relaxed">{stop.note}</p>
                </div>
              </div>

              {/* stop rail */}
              <div className="mt-6 flex items-center gap-1.5">
                {JOURNEY_STOPS.map((s, i) => (
                  <div key={s.key} className="flex-1 h-1 rounded-full overflow-hidden bg-white/15" title={s.name}>
                    <div className="h-full rounded-full transition-[width] duration-300" style={{ width: i <= active ? "100%" : "0%", background: s.tint }} />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/tours/bandarban-adventure" className="btn btn-white btn-sm">See this itinerary <ArrowRight className="h-4 w-4" /></Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/55"><MapPin className="h-3.5 w-3.5" /> {Math.round(progress * 100)}% of route travelled</span>
              </div>
            </div>
          </div>
        </div>

        {/* stop names along the bottom — always visible, keyboard focusable */}
        <nav className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-navy-900/70 backdrop-blur" aria-label="Journey stops">
          <div className="container-x grid grid-cols-3 sm:grid-cols-6">
            {JOURNEY_STOPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => {
                  const el = wrapRef.current;
                  if (!el) return;
                  const top = el.offsetTop + (el.scrollHeight - window.innerHeight) * (i / (JOURNEY_STOPS.length - 1));
                  window.scrollTo({ top, behavior: "smooth" });
                }}
                className={`py-3.5 text-[0.62rem] sm:text-[0.66rem] uppercase tracking-[0.1em] font-bold transition-colors border-t-2 ${i === active ? "border-sand-300 text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
                aria-current={i === active}
              >
                {s.name}
              </button>
            ))}
          </div>
        </nav>

        {webgl && (
          <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-[0.14em] text-white/35">Enhanced graphics</span>
        )}
      </div>
    </section>
  );
}
