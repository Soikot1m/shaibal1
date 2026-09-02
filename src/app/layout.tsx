import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/toaster";
import { FloatingActions } from "@/components/floating-actions";
import { CommandPalette } from "@/components/command-palette";
import { CookieConsent } from "@/components/cookie-consent";
import { getSessionUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/content";

const themeScript = `
try{const t=localStorage.getItem('sb_theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}
`;

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;600;700&display=swap";

export const metadata: Metadata = {
  title: {
    default: "Shaibal Tours & Travels — Explore More. Travel Better. Create Memories.",
    template: "%s · Shaibal Tours & Travels",
  },
  description:
    "Premium travel agency in Bogura, Bangladesh. Bandarban, Cox's Bazar, Sajek, Sylhet, Sundarbans and international tours with smart booking and live trip tracking.",
  keywords: [
    "Shaibal Tours & Travels", "Travel agency in Bogura", "Tour agency Bogura", "Bogura tour package",
    "Bangladesh tour package", "Bandarban tour", "Cox's Bazar tour", "Sajek tour", "Sylhet tour", "Bangladesh travel agency",
  ],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Shaibal Tours & Travels",
    description: "Explore More. Travel Better. Create Memories.",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: { card: "summary_large_image", title: "Shaibal Tours & Travels", description: "Explore More. Travel Better. Create Memories." },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#061c38",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getSessionUser(), getSiteSettings()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.brand,
    slogan: settings.tagline,
    address: { "@type": "PostalAddress", addressLocality: "Bogura", addressCountry: "BD" },
    areaServed: ["Bangladesh", "Nepal", "India", "Thailand", "Malaysia"],
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_URL} rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:top-2 focus:left-2 btn btn-primary">
          Skip to content
        </a>
        <Navbar user={user ? { name: user.name, isAdmin: user.isAdmin } : null} brand={settings.brand} />
        <main id="main">{children}</main>
        <Footer />
        <Toaster />
        <FloatingActions />
        <CommandPalette />
        <CookieConsent />
      </body>
    </html>
  );
}
