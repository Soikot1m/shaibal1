import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LayoutDashboard, CalendarDays, Compass, Wallet, Settings2, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/tours", label: "Tours", icon: Compass },
  { href: "/admin/finance", label: "Trips & Finance", icon: Wallet },
  { href: "/admin/content", label: "Content & Settings", icon: Settings2 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?next=/admin");
  return (
    <div className="admin pt-16 min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:flex flex-col border-r border-line bg-white/60 dark:bg-white/[0.03] p-5 sticky top-16 h-[calc(100vh-4rem)]">
        <Logo size={36} />
        <p className="chip mt-4 w-fit !text-xs">Admin console</p>
        <nav className="mt-6 space-y-1" aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-200">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-line">
          <div className="flex items-center gap-3"><Avatar name={admin.name} size={36} /><div className="min-w-0"><p className="text-sm font-semibold truncate">{admin.name}</p><p className="text-xs text-muted capitalize">{admin.role.replace("_", " ")}</p></div></div>
          <Link href="/" className="btn btn-ghost btn-sm w-full mt-3"><ExternalLink className="h-4 w-4" /> View website</Link>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="lg:hidden sticky top-16 z-30 glass-strong border-b border-line overflow-x-auto no-scrollbar">
          <nav className="flex gap-1 p-2 min-w-max" aria-label="Admin mobile">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/10"><n.icon className="h-3.5 w-3.5" /> {n.label}</Link>)}
          </nav>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">{children}</div>
      </div>
    </div>
  );
}
