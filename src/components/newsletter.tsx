"use client";
import { run } from "@/lib/action";
import { useState } from "react";
import { Send, Check } from "lucide-react";
import { submitNewsletter } from "@/app/actions";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const res = await run(submitNewsletter({ email }));
    setBusy(false);
    if (res.ok) {
      setMsg({ type: "ok", text: res.message });
      setEmail("");
    } else {
      setMsg({ type: "err", text: res.error });
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400"
        />
        <button type="submit" aria-label="Subscribe" className="grid place-items-center h-10 w-11 rounded-xl gradient-brand text-white shrink-0">
          {busy ? <Send className="h-4 w-4 animate-pulse" /> : msg?.type === "ok" ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
      {msg && <p className={msg.type === "ok" ? "text-emerald-300 text-xs mt-2" : "text-rose-300 text-xs mt-2"}>{msg.text}</p>}
    </div>
  );
}
