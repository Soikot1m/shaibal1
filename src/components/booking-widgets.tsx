"use client";
import { run } from "@/lib/action";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { Check, Clock, AlertTriangle, XCircle, Printer, Wallet, Share2 } from "lucide-react";
import { recordPayment } from "@/app/actions";
import { toast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { ProgressStep } from "@/db/schema";

export function BookingQR({ value, size = 140 }: { value: string; size?: number }) {
  return (
    <div className="inline-block p-3 bg-white rounded-2xl shadow-card">
      <QRCodeSVG value={value} size={size} level="M" fgColor="#061c38" />
    </div>
  );
}

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-ghost btn-sm"><Printer className="h-4 w-4" /> Print / Save invoice</button>
  );
}

export function ShareButton({ url, title }: { url: string; title: string }) {
  return (
    <button
      onClick={async () => {
        try {
          if (navigator.share) await navigator.share({ url, title });
          else {
            await navigator.clipboard.writeText(url);
            toast("Link copied to clipboard", "success");
          }
        } catch { /* cancelled */ }
      }}
      className="btn btn-ghost btn-sm"
    >
      <Share2 className="h-4 w-4" /> Share
    </button>
  );
}

export function PayPanel({ bookingId, total, paid, defaultMethod }: { bookingId: string; total: number; paid: number; defaultMethod?: string }) {
  const router = useRouter();
  const remaining = Math.max(0, total - paid);
  const deposit = Math.min(remaining, Math.round(total * 0.3));
  const [method, setMethod] = useState(defaultMethod || "bKash");
  const [amount, setAmount] = useState(deposit || remaining);
  const [busy, setBusy] = useState(false);
  if (remaining <= 0) return <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2"><Check className="h-4 w-4" /> Fully paid — thank you!</p>;

  const pay = async () => {
    setBusy(true);
    // Production: call /api/payments/initiate → gateway redirect → webhook verifies → booking updated.
    const res = await run(recordPayment({ bookingId, amount, method: "online", gateway: method, transactionId: `${method.slice(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}` }));
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast("Payment confirmed", "success");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {["bKash", "Nagad", "SSLCommerz", "Bank transfer"].map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`px-3 py-2 rounded-xl border text-sm font-semibold ${method === m ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10" : "border-line"}`}>{m}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setAmount(deposit)} className={`chip ${amount === deposit ? "chip-active" : ""}`}>Deposit {formatCurrency(deposit)}</button>
        <button onClick={() => setAmount(remaining)} className={`chip ${amount === remaining ? "chip-active" : ""}`}>Full {formatCurrency(remaining)}</button>
      </div>
      <button disabled={busy} onClick={pay} className="btn btn-primary w-full"><Wallet className="h-4 w-4" /> {busy ? "Processing…" : `Pay ${formatCurrency(amount)} via ${method}`}</button>
      <p className="text-[0.68rem] text-muted">Sandbox mode: this records a demo transaction. Connect real gateway keys in <code>.env</code> to go live.</p>
    </div>
  );
}

const icon = {
  completed: <Check className="h-3.5 w-3.5" />,
  upcoming: <Clock className="h-3.5 w-3.5" />,
  delayed: <AlertTriangle className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
};
const tone = {
  completed: "gradient-brand text-white",
  upcoming: "bg-gray-200 dark:bg-white/10 text-muted",
  delayed: "bg-amber-400 text-white",
  cancelled: "bg-rose-500 text-white",
};

export function TripProgress({ steps, progress, compact = false }: { steps: ProgressStep[]; progress: number; compact?: boolean }) {
  const current = steps.find((s) => s.status !== "completed") || steps[steps.length - 1];
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-semibold">Trip progress</span>
        <span className="font-extrabold text-sky-600 dark:text-sky-300">{progress}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full gradient-brand rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
      {current && <p className="text-xs text-muted mt-2">Current stage: <span className="font-semibold text-fg">{current.label}</span>{current.detail ? ` — ${current.detail}` : ""}</p>}
      {!compact && (
        <ol className="mt-4 space-y-3">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3 text-sm">
              <span className={`grid place-items-center h-6 w-6 rounded-full shrink-0 ${tone[s.status]}`}>{icon[s.status]}</span>
              <div>
                <p className={`font-semibold ${s.status === "upcoming" ? "text-muted" : ""}`}>{s.label}</p>
                {s.detail && <p className="text-xs text-muted">{s.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
