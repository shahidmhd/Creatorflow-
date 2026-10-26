"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, CheckCircle, LayoutDashboard, LogOut, Menu, User, Wallet, X } from "lucide-react";
import { getAuthSession, clearAuthData } from "../api";
import { LogoBrand, ThemeToggle } from "../components";

const navItems = [
  { label: "Overview", href: "/editor", Icon: LayoutDashboard },
  { label: "Browse Campaigns", href: "/editor/campaigns", Icon: BriefcaseBusiness },
  { label: "My Submissions", href: "/editor/submissions", Icon: CheckCircle },
  { label: "Earnings", href: "/editor/earnings", Icon: Wallet },
  { label: "Profile", href: "/editor/profile", Icon: User },
];

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checkingSession, setCheckingSession] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      clearAuthData();
      window.location.replace("/?auth=editor-login");
      return;
    }

    if (session.role !== "EDITOR") {
      const dest = session.role === "CREATOR" ? "/creator" : session.role === "ADMIN" ? "/admin" : "/";
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
    return <div className="min-h-screen bg-surface flex items-center justify-center text-sm font-semibold text-neutral-500">Loading Editor workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-neutral-900 dark:text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 dark:border-white/10 bg-white dark:bg-[#0c1829] px-5 py-7 lg:flex">
        <LogoBrand href="/editor" />
        <p className="mb-3 mt-8 px-3 text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Clipper workspace</p>
        <nav className="space-y-1">
          {navItems.map(({ label, href, Icon }) => {
            const active = href === "/editor" ? pathname === href : pathname.startsWith(href);
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
              <LogoBrand href="/editor" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mb-3 mt-6 px-3 text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Clipper workspace</p>
            <nav className="space-y-1.5 flex-1">
              {navItems.map(({ label, href, Icon }) => {
                const active = href === "/editor" ? pathname === href : pathname.startsWith(href);
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
            <LogoBrand href="/editor" />
          </div>
          <span className="hidden text-sm font-medium text-neutral-500 dark:text-neutral-400 lg:block">Clipper workspace</span>
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
