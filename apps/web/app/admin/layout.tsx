"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, Wallet } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", Icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", Icon: Users },
  { label: "Campaigns", href: "/admin/campaigns", Icon: BriefcaseBusiness },
  { label: "Platform Fees", href: "/admin/settings", Icon: Settings },
  { label: "Admin Profile", href: "/admin/profile", Icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const rawSession = localStorage.getItem("creatorflow-session");
    if (!rawSession) {
      window.location.replace("/?auth=creator-login");
      return;
    }

    try {
      const session = JSON.parse(rawSession) as { role?: string };
      if (session.role !== "ADMIN") {
        const dest = session.role === "EDITOR" ? "/editor" : "/creator";
        window.location.replace(dest);
        return;
      }
      setCheckingSession(false);
    } catch {
      localStorage.removeItem("creatorflow-session");
      window.location.replace("/");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("creatorflow-session");
    localStorage.removeItem("creatorflow-token");
    window.location.replace("/");
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-sm font-semibold text-neutral-500">Loading Admin console...</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 bg-white px-5 py-7 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-black text-white">CF</span>
          <span className="text-xl font-black tracking-[-0.08em]">CREATORFLOW</span>
        </Link>
        <p className="mb-3 mt-10 px-3 text-xs font-bold uppercase tracking-[.16em] text-neutral-400">Admin Control</p>
        <nav className="space-y-1">
          {navItems.map(({ label, href, Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active ? "bg-navy-soft text-navy font-bold" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-600 transition hover:bg-navy-soft hover:text-navy"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-black text-white">CF</span>
            <span className="font-black tracking-[-0.08em]">ADMIN</span>
          </div>
          <span className="hidden text-sm font-semibold text-neutral-500 lg:block">System Administration</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-600"
          >
            <LogOut size={14} /> Log out
          </button>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
