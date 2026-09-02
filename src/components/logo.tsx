import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  size = 40,
  showText = true,
  className,
  href = "/",
}: {
  light?: boolean;
  size?: number;
  showText?: boolean;
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 shrink-0 group", className)} aria-label="Shaibal Tours & Travels — Home">
      <Image
        src="/logo.png"
        alt="Shaibal Tours & Travels logo"
        width={size}
        height={size}
        priority
        className="rounded-[26%] shadow-float transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="leading-none">
          <span className={cn("font-display font-extrabold tracking-tight block text-[1.05rem]", light ? "text-white" : "text-fg")}>
            SHAIBAL
          </span>
          <span className={cn("text-[0.58rem] font-bold uppercase tracking-[0.26em] block mt-1", light ? "text-sky-200/90" : "text-sky-600 dark:text-sky-300")}>
            Tours &amp; Travels
          </span>
        </span>
      )}
    </Link>
  );
}
