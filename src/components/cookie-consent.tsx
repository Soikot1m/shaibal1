"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("sb_consent")) setShow(true);
    } catch { /* ignore */ }
  }, []);

  const save = (a: boolean, m: boolean) => {
    try {
      localStorage.setItem("sb_consent", JSON.stringify({ analytics: a, marketing: m, at: Date.now() }));
      // Analytics loaders (GA / GTM / Meta Pixel) should read this before injecting scripts.
      window.dispatchEvent(new CustomEvent("app:consent", { detail: { analytics: a, marketing: m } }));
    } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed z-[90] bottom-[74px] lg:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm card glass-strong shadow-float p-4" role="dialog" aria-label="Cookie preferences">
      <div className="flex gap-3">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 shrink-0"><Cookie className="h-5 w-5" /></span>
        <div className="text-sm">
          <p className="font-semibold">We value your privacy</p>
          <p className="text-xs text-muted mt-1">We use essential cookies to run the site. Optional analytics load only with your consent. <Link href="/cookie-policy" className="underline">Cookie policy</Link></p>
        </div>
      </div>
      {manage && (
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center justify-between"><span>Essential</span><input type="checkbox" checked disabled /></label>
          <label className="flex items-center justify-between"><span>Analytics</span><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /></label>
          <label className="flex items-center justify-between"><span>Marketing</span><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /></label>
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={() => save(true, true)} className="btn btn-primary btn-sm flex-1">Accept</button>
        <button onClick={() => save(false, false)} className="btn btn-ghost btn-sm flex-1">Reject</button>
        {manage ? (
          <button onClick={() => save(analytics, marketing)} className="btn btn-soft btn-sm">Save</button>
        ) : (
          <button onClick={() => setManage(true)} className="btn btn-soft btn-sm">Manage</button>
        )}
      </div>
    </div>
  );
}
