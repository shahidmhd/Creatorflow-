"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CircleDollarSign, History, LayoutDashboard, LogOut, Menu, Settings, ShieldAlert, Users, X } from "lucide-react";
import { getAuthSession, clearAuthData } from "../api";
import { ThemeToggle } from "../components";

const navItems = [
  { label: "Overview", href: "/admin", Icon: LayoutDashboard },
  { label: "Revenue", href: "/admin/revenue", Icon: CircleDollarSign },
  { label: "Campaigns", href: "/admin/campaigns", Icon: BriefcaseBusiness },
  { label: "Users", href: "/admin/users", Icon: Users },
  { label: "Activity Logs", href: "/admin/audit-logs", Icon: History },
  { label: "Reports & Flags", href: "/admin/reports", Icon: AlertTriangle },
  { label: "Platform Fees", href: "/admin/settings", Icon: Settings },
  { label: "Admin Profile", href: "/admin/profile", Icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      clearAuthData();
      window.location.replace("/?auth=admin-login");
      return;
    }

    if (session.role !== "ADMIN") {
      const dest = session.role === "EDITOR" ? "/editor" : "/creator";
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
    return <div className="min-h-screen bg-surface flex items-center justify-center text-sm font-semibold text-neutral-500">Loading Admin console...</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-neutral-900 dark:text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 dark:border-white/10 bg-white dark:bg-[#0c1829] px-5 py-7 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-black text-white">CF</span>
          <span className="text-xl font-black tracking-[-0.08em] text-neutral-900 dark:text-white">CREATORFLOW</span>
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
                  active
                    ? "bg-navy-soft dark:bg-white/10 text-navy dark:text-cyan-400 font-bold"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5"
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
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300 transition hover:bg-navy-soft dark:hover:bg-white/5 hover:text-navy dark:hover:text-cyan-400"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* Mobile Sidebar Overlay & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0c1829] p-6 shadow-2xl flex">
            <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/10">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-left">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-black text-white">CF</span>
                <span className="text-xl font-black tracking-[-0.08em] text-neutral-900 dark:text-white">CREATORFLOW</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mb-3 mt-6 px-3 text-xs font-bold uppercase tracking-[.16em] text-neutral-400">Admin Control</p>
            <nav className="space-y-1.5 flex-1">
              {navItems.map(({ label, href, Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-navy-soft dark:bg-white/10 text-navy dark:text-cyan-400 font-bold"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5"
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
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300 transition hover:bg-navy-soft dark:hover:bg-white/5 hover:text-navy dark:hover:text-cyan-400"
            >
              <LogOut size={18} />
              Log out
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Transparent Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 dark:border-white/5 bg-transparent backdrop-blur-md px-5 md:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 text-neutral-900 dark:text-white shadow-xs"
              aria-label="Open mobile menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-black text-white">CF</span>
              <span className="font-black tracking-[-0.08em] text-neutral-900 dark:text-white">ADMIN</span>
            </div>
          </div>
          <span className="hidden text-sm font-semibold text-neutral-500 dark:text-neutral-400 lg:block">System Administration</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/20"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-7 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
