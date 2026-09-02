"use client";
import { run } from "@/lib/action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, BellOff } from "lucide-react";
import { toggleFavorite, updateProfile, markNotificationsRead, logout, changePassword } from "@/app/actions";
import { toast } from "@/lib/toast";

export function SaveButton({ type, id, saved, compact = false }: { type: "tour" | "destination" | "blog"; id: string; saved: boolean; compact?: boolean }) {
  const [isSaved, setSaved] = useState(saved);
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const res = await run(toggleFavorite(type, id));
        if (!res.ok) return toast(res.error, "warning");
        setSaved(res.saved);
        toast(res.message, "success");
        router.refresh();
      }}
      className={compact ? "grid place-items-center h-9 w-9 rounded-full glass" : "btn btn-ghost btn-sm"}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save"}
    >
      <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} /> {!compact && (isSaved ? "Saved" : "Save")}
    </button>
  );
}

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [f, setF] = useState({ name, phone });
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await run(updateProfile(f));
        setBusy(false);
        toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
      }}
      className="grid sm:grid-cols-2 gap-3"
    >
      <label className="field">Full name<input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="field">Phone<input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      <label className="field sm:col-span-2">Email<input className="input" value={email} disabled /></label>
      <button disabled={busy} className="btn btn-primary w-fit">{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (f.next !== f.confirm) return toast("New passwords do not match.", "error");
        setBusy(true);
        const res = await run(changePassword({ current: f.current, next: f.next }));
        setBusy(false);
        toast(res.ok ? res.message : res.error, res.ok ? "success" : "error");
        if (res.ok) setF({ current: "", next: "", confirm: "" });
      }}
      className="grid sm:grid-cols-3 gap-3"
    >
      <label className="field">Current password<input type="password" required autoComplete="current-password" className="input" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></label>
      <label className="field">New password<input type="password" required minLength={8} autoComplete="new-password" className="input" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} placeholder="At least 8 characters" /></label>
      <label className="field">Confirm new password<input type="password" required minLength={8} autoComplete="new-password" className="input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></label>
      <div className="sm:col-span-3 flex items-center gap-3">
        <button disabled={busy} className="btn btn-primary w-fit">{busy ? "Updating…" : "Update password"}</button>
        <span className="text-xs text-muted">Other signed-in devices will be logged out.</span>
      </div>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button onClick={async () => { await run(logout()); router.push("/"); router.refresh(); }} className="btn btn-ghost btn-sm"><LogOut className="h-4 w-4" /> Sign out</button>
  );
}

export function MarkReadButton() {
  const router = useRouter();
  return (
    <button onClick={async () => { const r = await run(markNotificationsRead()); toast(r.ok ? r.message : r.error); router.refresh(); }} className="btn btn-ghost btn-sm"><BellOff className="h-4 w-4" /> Mark all read</button>
  );
}
