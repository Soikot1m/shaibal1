import Link from "next/link";
import Image from "next/image";
import { Compass, Home, Search } from "lucide-react";
import { IMG } from "@/lib/images";

export default function NotFound() {
  return (
    <div className="relative min-h-[90svh] flex items-center justify-center overflow-hidden">
      <img src={IMG.cloudMountains} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative text-center text-white px-6 max-w-lg">
        <Image src="/logo.png" alt="Shaibal Tours" width={64} height={64} className="mx-auto rounded-[26%] shadow-float" />
        <p className="font-display font-extrabold text-8xl mt-6 gradient-text-light">404</p>
        <h1 className="font-display font-extrabold text-3xl mt-2">Looks like you wandered off the trail</h1>
        <p className="text-white/80 mt-3">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on the road.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Link href="/" className="btn btn-primary"><Home className="h-4 w-4" /> Home</Link>
          <Link href="/tours" className="btn btn-glass"><Compass className="h-4 w-4" /> Explore tours</Link>
          <Link href="/destinations" className="btn btn-glass"><Search className="h-4 w-4" /> Destinations</Link>
        </div>
      </div>
    </div>
  );
}
