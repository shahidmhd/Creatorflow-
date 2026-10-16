"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, LayoutGrid, LogOut, Settings, Wallet } from "lucide-react";
import { getAuthSession, clearAuthData } from "../api";

const navItems = [
  { label: "Overview", href: "/creator", altHref: "/brand", Icon: LayoutGrid },
  { label: "Campaigns", href: "/creator/campaigns", altHref: "/brand/campaigns", Icon: BriefcaseBusiness },
  { label: "Wallet & Billing", href: "/creator/wallet", altHref: "/brand/wallet", Icon: Wallet },
  { label: "Settings", href: "/creator/settings", altHref: "/brand/settings", Icon: Settings },
];

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      clearAuthData();
      window.location.replace("/?auth=creator-login");
      return;
    }

    if (session.role !== "CREATOR") {
      const dest = session.role === "EDITOR" ? "/editor" : session.role === "ADMIN" ? "/admin" : "/";
      window.location.replace(dest);
      return;
    }
    setCheckingSession(false);
  }, []);

  const logout = () => {
    clearAuthData();
    window.location.replace("/");
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-sm font-semibold text-neutral-500">Loading Brand workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-navy/10 bg-white px-5 py-7 lg:flex">
        <Link href="/creator" className="flex items-center gap-2.5 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-black text-white">Re</span>
          <span className="text-xl font-black tracking-[-0.08em] text-neutral-900">REVIRAL</span>
        </Link>
        <p className="mb-3 mt-8 px-3 text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Brand workspace</p>
        <nav className="space-y-1">
          {navItems.map(({ label, href, altHref, Icon }) => {
            const active = href === "/creator"
              ? (pathname === "/creator" || pathname === "/brand")
              : (pathname.startsWith(href) || (altHref && pathname.startsWith(altHref)));
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy/10 bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-black text-white">Re</span>
            <span className="font-black tracking-[-0.08em] text-neutral-900">REVIRAL</span>
          </div>
          <span className="hidden text-sm font-medium text-neutral-500 lg:block">Brand workspace</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
          >
            <LogOut size={14} /> Log out
          </button>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
