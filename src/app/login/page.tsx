"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { login, register } from "@/app/actions";
import { run, NETWORK_ERROR } from "@/lib/action";
import { toast } from "@/lib/toast";
import { IMG } from "@/lib/images";

type AuthResult = { ok: true; isAdmin: boolean; name: string } | { ok: false; error: string };

async function authenticate(mode: "login" | "register", form: { name: string; email: string; phone: string; password: string }): Promise<AuthResult> {
  // 1) Server Action. 2) If the transport fails (proxy/CSRF/offline), fall back to the JSON endpoint.
  const viaAction = await run(mode === "login" ? login({ email: form.email, password: form.password }) : register(form));
  if (viaAction.ok || viaAction.error !== NETWORK_ERROR) return viaAction as AuthResult;
  try {
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, ...form }) });
    return (await res.json()) as AuthResult;
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const next = params.get("next");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    const res = await authenticate(mode, form);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    toast(mode === "login" ? `Welcome back, ${res.name.split(" ")[0]}.` : "Account created — welcome aboard.", "success");
    router.push(next || (res.isAdmin ? "/admin" : "/account"));
    router.refresh();
  };

  const fill = (email: string) => {
    setMode("login");
    setForm((f) => ({ ...f, email, password: "shaibal123" }));
  };

  return (
    <div className="w-full max-w-md">
      <Image src="/logo.png" alt="Shaibal Tours & Travels" width={48} height={48} className="rounded-[26%] shadow-card" />
      <h1 className="mt-6 text-[2.2rem]">{mode === "login" ? "Welcome back." : "Create your account."}</h1>
      <p className="mt-2 text-muted text-sm">{mode === "login" ? "Sign in to see bookings, payments and live trip progress." : "Save tours, track trips and manage payments in one place."}</p>

      <div className="mt-8 flex gap-6 border-b border-line text-sm font-semibold">
        {(["login", "register"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setErr(""); }} className={`pb-3 -mb-px border-b-2 transition-colors ${mode === m ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}>
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        {mode === "register" && (
          <label className="field">Full name
            <span className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" /><input required autoComplete="name" className="input pl-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></span>
          </label>
        )}
        <label className="field">Email address
          <span className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" /><input required type="email" autoComplete="email" className="input pl-9" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></span>
        </label>
        {mode === "register" && (
          <label className="field">Phone <span className="!text-muted !font-normal !text-xs">(optional)</span>
            <span className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" /><input autoComplete="tel" className="input pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880 1…" /></span>
          </label>
        )}
        <label className="field">Password
          <span className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" /><input required type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} className="input pl-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></span>
        </label>
        {err && <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-200 rounded-lg px-3 py-2.5">{err}</p>}
        <button disabled={busy} className="btn btn-primary w-full btn-lg">{busy ? "Signing in…" : mode === "login" ? "Sign in" : "Create account"} {!busy && <ArrowRight className="h-4 w-4" />}</button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-line p-4 text-xs">
        <p className="font-semibold text-fg mb-2">Demo access</p>
        <p className="text-muted mb-3">Password for both accounts: <code className="font-mono text-fg">shaibal123</code></p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fill("admin@shaibaltours.com")} className="btn btn-ghost btn-sm">Use admin account</button>
          <button type="button" onClick={() => fill("demo@shaibaltours.com")} className="btn btn-ghost btn-sm">Use customer account</button>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted">By continuing you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy-policy" className="underline">privacy policy</Link>. Google and phone sign-in can be enabled with provider keys.</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100svh] grid lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden lg:block bg-navy-900">
        <img src={IMG.sajekHills} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative h-full flex flex-col justify-end p-14 text-white">
          <p className="eyebrow !text-sand-300 mb-5">Your journey starts here</p>
          <h2 className="text-[3rem] max-w-lg text-white">Bookings, payments and live trip progress — <em className="!text-sand-300">in one place.</em></h2>
          <p className="mt-5 text-white/70 max-w-md">Every booking comes with a QR ticket, an invoice and a live tracker your family can follow.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-28 lg:py-12">
        <Suspense fallback={<div className="w-full max-w-md h-96 shimmer rounded-xl" />}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
