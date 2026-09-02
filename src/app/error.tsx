"use client";
import Link from "next/link";
import { RefreshCw, Home, LifeBuoy } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[80svh] grid place-items-center px-6 pt-20">
      <div className="card p-8 sm:p-10 max-w-md text-center shadow-float">
        <span className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 text-3xl">⚠️</span>
        <h1 className="font-display font-extrabold text-2xl mt-5">Something went wrong</h1>
        <p className="text-sm text-muted mt-2">We hit a bump on the road. Please try again — if the problem continues, our team is here to help.</p>
        {error.digest && <p className="text-[0.65rem] text-muted font-mono mt-2">Ref: {error.digest}</p>}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button onClick={reset} className="btn btn-primary"><RefreshCw className="h-4 w-4" /> Try again</button>
          <Link href="/" className="btn btn-ghost"><Home className="h-4 w-4" /> Home</Link>
          <Link href="/contact#support" className="btn btn-ghost"><LifeBuoy className="h-4 w-4" /> Support</Link>
        </div>
      </div>
    </div>
  );
}
