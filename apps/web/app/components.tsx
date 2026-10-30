"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Pencil,
  LogIn,
  Scissors,
  Sparkles,
  Instagram,
  Youtube,
  Users,
  CheckCircle2,
  TrendingUp,
  Video,
  ArrowRight,
  Linkedin,
} from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("reviral-theme") || localStorage.getItem("creatorflow-theme");
    const next = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);
  function toggle() {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    const themeVal = next ? "dark" : "light";
    localStorage.setItem("reviral-theme", themeVal);
    localStorage.setItem("creatorflow-theme", themeVal);
  }
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid h-10 w-10 place-items-center rounded-full border border-navy/15 bg-white text-navy shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-sky-300 dark:hover:bg-white/10"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function LogoBrand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="Reviral home" className="flex items-center gap-2.5 text-left group">
      <img
        src="/logo.png"
        alt="Reviral"
        className="h-8 md:h-9 w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-105"
      />
      <img
        src="/logo-dark.png"
        alt="Reviral"
        className="h-8 md:h-9 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
}

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const links: [string, string][] = [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setBrandOpen(false);
      }
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setEditorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function triggerAuth(flow: "creator" | "editor" | "admin", mode: "login" | "create" = "login") {
    if (typeof window !== "undefined") {
      const authParam = flow === "admin" ? "admin-login" : flow === "editor" ? (mode === "login" ? "editor-login" : "editor-create") : (mode === "login" ? "brand-login" : "brand-create");
      if (window.location.pathname !== "/") {
        window.location.href = `/?auth=${authParam}`;
        return;
      }
      const newUrl = `${window.location.pathname}?auth=${authParam}`;
      window.history.pushState(null, "", newUrl);
      const event = new CustomEvent("open-auth", { detail: { flow, mode } });
      window.dispatchEvent(event);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 dark:border-white/5 bg-transparent backdrop-blur-md transition-colors">
      <div className="container flex h-20 items-center justify-between">
        <LogoBrand />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-700 dark:text-neutral-300 md:flex">
          {links.map(([label, href]) => (
            <Link className="transition hover:text-navy dark:hover:text-cyan-400" key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Brand Sign In */}
          <div className="relative hidden sm:block" ref={brandRef}>
            <button
              onClick={() => {
                setBrandOpen(!brandOpen);
                setEditorOpen(false);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white transition"
              aria-expanded={brandOpen}
            >
              <span>Brand Sign In</span>
              <ChevronDown
                size={14}
                className={`text-neutral-500 transition-transform duration-200 ${brandOpen ? "rotate-180" : ""}`}
              />
            </button>

            {brandOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-[#0c1829] z-50">
                <button
                  onClick={() => {
                    setBrandOpen(false);
                    triggerAuth("creator", "login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-800 transition hover:bg-navy-soft/60 hover:text-navy dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <LogIn size={15} className="text-navy dark:text-sky-400 shrink-0" />
                  <div>
                    <div className="font-bold">Sign In</div>
                    <div className="text-[11px] font-normal text-neutral-500">Access brand portal</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setBrandOpen(false);
                    triggerAuth("creator", "create");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-800 transition hover:bg-navy-soft/60 hover:text-navy dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <Sparkles size={15} className="text-navy dark:text-sky-400 shrink-0" />
                  <div>
                    <div className="font-bold">Create Account</div>
                    <div className="text-[11px] font-normal text-neutral-500">Launch campaigns & pay views</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Editor Sign In */}
          <div className="relative hidden sm:block" ref={editorRef}>
            <button
              onClick={() => {
                setEditorOpen(!editorOpen);
                setBrandOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0c142b] hover:bg-[#142045] px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-[0.99] dark:bg-white dark:text-[#0c142b]"
              aria-expanded={editorOpen}
            >
              <span>Editor Sign In</span>
              <ArrowRight size={13} className="shrink-0" />
            </button>

            {editorOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-navy/10 bg-white p-1.5 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-[#0c1829] z-50">
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    triggerAuth("editor", "login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-800 transition hover:bg-navy-soft/60 hover:text-navy dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <LogIn size={15} className="text-navy dark:text-sky-400 shrink-0" />
                  <div>
                    <div className="font-bold">Sign In</div>
                    <div className="text-[11px] font-normal text-neutral-500">Access editor workspace</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    triggerAuth("editor", "create");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-800 transition hover:bg-navy-soft/60 hover:text-navy dark:text-neutral-200 dark:hover:bg-white/5"
                >
                  <Scissors size={15} className="text-navy dark:text-sky-400 shrink-0" />
                  <div>
                    <div className="font-bold">Join as Editor</div>
                    <div className="text-[11px] font-normal text-neutral-500">Edit clips & earn rewards</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            className="icon-button shrink-0 md:hidden !text-neutral-900 dark:!text-white bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/15"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container pb-5 md:hidden">
          <nav className="rounded-3xl border border-black/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0c1829]/95 space-y-4">
            <div className="grid gap-1">
              <a
                onClick={() => setOpen(false)}
                className="py-2.5 px-3 rounded-xl font-bold text-sm text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                href="#for-brands"
              >
                For Brands
              </a>
              <a
                onClick={() => setOpen(false)}
                className="py-2.5 px-3 rounded-xl font-bold text-sm text-neutral-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
                href="#for-creators"
              >
                For Editors
              </a>
            </div>

            <div className="border-t border-black/10 dark:border-white/10" />

            <div className="grid gap-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Brand</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    triggerAuth("creator", "login");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 bg-neutral-100 dark:bg-white/10 py-2.5 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition shadow-xs"
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#01173b] text-[9px] text-white">B</span>
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    triggerAuth("creator", "create");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-black/15 dark:border-white/20 bg-neutral-100 dark:bg-white/10 py-2.5 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </div>

            <div className="grid gap-2 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Editor</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    triggerAuth("editor", "login");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#01173b] via-[#091e42] to-black py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition border border-white/10"
                >
                  <Pencil size={12} className="text-[#e5e7eb]" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    triggerAuth("editor", "create");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-black/15 dark:border-white/20 bg-neutral-100 dark:bg-white/10 py-2.5 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition shadow-xs"
                >
                  Join as Editor
                </button>
              </div>
            </div>

            <div className="border-t border-black/10 dark:border-white/10 pt-2 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  triggerAuth("admin", "login");
                }}
                className="text-xs font-bold text-neutral-500 hover:text-[#01173b] dark:text-neutral-400 dark:hover:text-[#e5e7eb] transition"
              >
                Admin Console Access →
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#070b14] transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 dark:text-neutral-400">
        {/* Left: Logo + Copyright */}
        <div className="flex items-center gap-3">
          <LogoBrand />
          <span>© 2026 Reviral. All rights reserved.</span>
        </div>

        {/* Center: Legal Menu */}
        <div className="flex items-center gap-6 font-semibold text-neutral-600 dark:text-neutral-400">
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-black dark:hover:text-white transition">Terms &amp; Conditions</Link>
        </div>

        {/* Right: Auth links */}
        <div className="flex flex-wrap items-center gap-3 font-medium text-neutral-600 dark:text-neutral-400">
          <Link href="/?auth=creator-login" className="hover:text-black dark:hover:text-white transition">Brand sign in</Link>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <Link href="/?auth=creator-create" className="hover:text-black dark:hover:text-white transition">Start a campaign</Link>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <Link href="/?auth=editor-create" className="hover:text-black dark:hover:text-white transition">Editor sign in / Join</Link>
        </div>

        {/* Far Right: Social Icons */}
        <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X Twitter" className="hover:text-black dark:hover:text-white transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-red-600 transition">
            <Youtube size={16} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-blue-600 transition">
            <Linkedin size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "status-draft", PUBLISHED: "status-published", PAUSED: "status-paused",
    COMPLETED: "status-completed", CANCELLED: "status-cancelled", PENDING: "status-pending",
    APPROVED: "status-approved", REJECTED: "status-rejected", CREDITED: "status-credited",
    PENDING_VERIFICATION: "status-pending", VERIFIED: "status-approved",
    CHANGES_REQUESTED: "status-paused", SUBMITTED: "status-pending", WITHDRAWN: "status-cancelled",
  };
  return <span className={`status-badge ${map[status] ?? "status-draft"}`}>{status.replace(/_/g, " ")}</span>;
}

export function CampaignDummyThumbnail({
  title,
  category,
  platform,
}: {
  title?: string;
  category?: string;
  platform?: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#01173b] via-[#081a38] to-black p-4 flex flex-col justify-between text-white select-none">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md text-white/90 border border-white/10">
          <Sparkles size={11} className="text-[#e5e7eb]" /> {category || "Campaign"}
        </span>
        <div className="h-6 w-6 rounded-full bg-white/10 grid place-items-center backdrop-blur-md border border-white/10">
          {platform === "YouTube" ? (
            <span className="text-white font-black text-[11px]">▶</span>
          ) : (
            <span className="text-white font-black text-[11px]">📸</span>
          )}
        </div>
      </div>

      <div className="my-auto text-center px-2 py-4">
        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-inner text-white font-black text-sm">
          Re
        </div>
        <p className="text-xs font-black line-clamp-1 tracking-tight text-white/90">{title || "Reviral Campaign"}</p>
        <p className="text-[10px] text-[#e5e7eb]/70 tracking-wider uppercase mt-0.5 font-bold">Verified Brief</p>
      </div>

      <div className="flex items-center justify-between text-[10px] font-semibold text-white/50 border-t border-white/10 pt-2">
        <span>REVIRAL</span>
        <span className="text-[#e5e7eb] font-bold">Active Payout</span>
      </div>
    </div>
  );
}

export interface CampaignCardData {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  videoUrl?: string | null;
  category: string;
  socialPlatform: "Instagram" | "YouTube" | string;
  campaignFund?: number;
  rewardAmount?: number;
  editorRewardPool?: number;
  editorSlots?: number;
  approvedEditorsCount?: number;
  remainingSlots?: number;
  maximumEditorEarning?: number;
  earningPer1000Views?: number;
  minimumViews?: number;
  deadline?: string;
  creator?: {
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export function CampaignCard({
  campaign,
  href,
}: {
  campaign: CampaignCardData;
  href?: string;
}) {
  const [imgError, setImgError] = useState(false);

  const maxEarningMajor = Math.floor(
    (campaign.maximumEditorEarning ||
      Math.floor(((campaign.rewardAmount || campaign.campaignFund || 100000) * 0.85) / (campaign.editorSlots || 1))) / 100
  );

  const rateVal = campaign.earningPer1000Views
    ? (campaign.earningPer1000Views / 100).toFixed(2)
    : "8.50";

  const totalSlots = campaign.editorSlots || 1;
  const approvedCount = campaign.approvedEditorsCount || 0;
  const remaining =
    campaign.remainingSlots !== undefined
      ? campaign.remainingSlots
      : Math.max(0, totalSlots - approvedCount);

  const percentFilled = Math.min(100, Math.round(((totalSlots - remaining) / totalSlots) * 100));
  const targetLink = href || `/editor/campaigns/${campaign.id}`;

  return (
    <Link
      href={targetLink}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-3.5 shadow-xs hover:border-[#01173b]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 dark:border-white/10 dark:bg-[#071329] dark:hover:border-white/20"
    >
      <div>
        {/* 16:9 Thumbnail or Dummy Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 border border-[#e5e7eb] dark:border-white/10">
          {campaign.thumbnail && !imgError ? (
            <img
              src={campaign.thumbnail}
              alt={campaign.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <CampaignDummyThumbnail
              title={campaign.title}
              category={campaign.category}
              platform={campaign.socialPlatform}
            />
          )}

          {/* Platform Badge Overlay with Lucide Icons */}
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-[#e5e7eb]/20 shadow-xs">
            {campaign.socialPlatform === "YouTube" ? (
              <span className="flex items-center gap-1.5 text-white">
                <Youtube size={13} className="text-white fill-current" />
                <span>YouTube</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white">
                <Instagram size={13} className="text-[#e5e7eb]" />
                <span>Instagram</span>
              </span>
            )}
          </div>

          {/* Raw Footage Indicator Badge */}
          {campaign.videoUrl && (
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#01173b]/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20 shadow-xs">
              <Video size={11} className="text-[#e5e7eb]" />
              <span>Footage Ready</span>
            </div>
          )}
        </div>

        {/* Creator Info Row */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#01173b] text-[10px] font-black text-white dark:bg-white dark:text-[#01173b]">
              {campaign.creator?.name?.slice(0, 2).toUpperCase() || "RE"}
            </div>
            <div className="min-w-0 flex items-center gap-1">
              <span className="truncate text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {campaign.creator?.name || "Creator"}
              </span>
              <span title="Verified Creator" className="inline-flex shrink-0">
                <CheckCircle2 size={13} className="text-[#01173b] dark:text-sky-300" />
              </span>
            </div>
          </div>
          <span className="rounded-md border border-[#e5e7eb] bg-[#e5e7eb]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-[#e5e7eb]">
            {campaign.category}
          </span>
        </div>

        {/* Campaign Title */}
        <h3 className="mt-2.5 line-clamp-2 text-sm font-black tracking-tight text-neutral-900 group-hover:text-[#01173b] dark:text-white dark:group-hover:text-sky-300 transition leading-snug">
          {campaign.title}
        </h3>
      </div>

      {/* Financials & Slot Metrics Footer */}
      <div className="mt-4 border-t border-[#e5e7eb] dark:border-white/10 pt-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#e5e7eb]">
              Max Payout
            </span>
            <span className="text-sm font-black text-[#01173b] dark:text-white">
              ₹{maxEarningMajor.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#01173b]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#01173b] border border-[#01173b]/20 dark:bg-white/10 dark:text-white dark:border-white/15">
              <TrendingUp size={11} className="shrink-0 text-[#01173b] dark:text-[#e5e7eb]" />
              <span>₹{rateVal} / 1k</span>
            </span>
          </div>
        </div>

        {/* Slots remaining bar with Lucide Users icon */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-[#01173b] dark:text-sky-300 shrink-0" />
              <span className={remaining === 0 ? "text-black dark:text-white font-bold" : "text-neutral-700 dark:text-neutral-200"}>
                {remaining === 0 ? "Slots full" : `${remaining} of ${totalSlots} slots left`}
              </span>
            </span>
            {campaign.minimumViews && campaign.minimumViews > 0 ? (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Min {campaign.minimumViews.toLocaleString()} views
              </span>
            ) : null}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                remaining === 0 ? "bg-black dark:bg-white" : "bg-[#01173b] dark:bg-white"
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
