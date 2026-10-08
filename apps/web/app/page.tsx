"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleUserRound,
  Filter,
  Flame,
  Globe,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Footer, PublicNav, StatusBadge, CampaignCard, CampaignCardData } from "./components";
import { authApi, api, UserSession } from "./api";

const faqs = [
  "How much does CreatorFlow charge?",
  "How do creators launch and fund campaigns?",
  "How are editor reward payouts computed?",
  "Can an editor request changes or resubmit content?",
];

const fallbackCampaigns: CampaignCardData[] = [
  {
    id: "c-1",
    title: "Summer Viral Reels Challenge",
    description: "Produce dynamic 9:16 vertical edits featuring fast-paced hooks, aesthetic typography overlays, and sound design.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    category: "Fashion",
    socialPlatform: "Instagram",
    campaignFund: 100000,
    rewardAmount: 100000,
    editorSlots: 10,
    maximumEditorEarning: 8500, // ₹85
    earningPer1000Views: 850, // ₹8.50 per 1k views
    minimumViews: 10000,
    approvedEditorsCount: 7,
    remainingSlots: 3,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    creator: { name: "Aria Studio", username: "ariastudio" },
  },
  {
    id: "c-2",
    title: "Next-Gen Tech Gadget Unboxing Short",
    description: "Snappy, high-retention product unboxings highlighting specs, visual close-ups, and punchy transitions.",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60",
    category: "Tech",
    socialPlatform: "YouTube",
    campaignFund: 250000,
    rewardAmount: 250000,
    editorSlots: 5,
    maximumEditorEarning: 42500, // ₹425
    earningPer1000Views: 1500, // ₹15.00 per 1k views
    minimumViews: 25000,
    approvedEditorsCount: 2,
    remainingSlots: 3,
    deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
    creator: { name: "Neon Byte", username: "neonbyte" },
  },
  {
    id: "c-3",
    title: "High-Intensity Fitness Transformation Reel",
    description: "Sync motivational voiceovers with workout montage clips and bass-heavy audio pacing.",
    thumbnail: null, // Test dummy image display
    category: "Fitness",
    socialPlatform: "Instagram",
    campaignFund: 150000,
    rewardAmount: 150000,
    editorSlots: 8,
    maximumEditorEarning: 15937, // ₹159.37
    earningPer1000Views: 1200, // ₹12.00 per 1k views
    minimumViews: 12000,
    approvedEditorsCount: 4,
    remainingSlots: 4,
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
    creator: { name: "FitPulse Media", username: "fitpulse" },
  },
  {
    id: "c-4",
    title: "Epic Gaming Highlights & Montage Series",
    description: "Transform raw stream VODs into viral YouTube Shorts with kinetic zoom-ins and sound effects.",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
    category: "Gaming",
    socialPlatform: "YouTube",
    campaignFund: 180000,
    rewardAmount: 180000,
    editorSlots: 6,
    maximumEditorEarning: 25500, // ₹255
    earningPer1000Views: 1000, // ₹10.00 per 1k views
    minimumViews: 20000,
    approvedEditorsCount: 1,
    remainingSlots: 5,
    deadline: new Date(Date.now() + 86400000 * 6).toISOString(),
    creator: { name: "Apex Pulse", username: "apexpulse" },
  },
];

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" aria-busy="true" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");
  const isAuthFlow =
    auth === "creator-login" ||
    auth === "creator-create" ||
    auth === "editor-login" ||
    auth === "editor-create" ||
    auth === "admin-login";

  const [authOpen, setAuthOpen] = useState(isAuthFlow);
  const [authMode, setAuthMode] = useState<"create" | "login">(auth?.endsWith("-login") ? "login" : "create");
  const [authFlow, setAuthFlow] = useState<"creator" | "editor" | "admin">(
    auth === "admin-login" ? "admin" : auth?.startsWith("editor-") ? "editor" : "creator"
  );
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", otp: "" });
  const [authNotice, setAuthNotice] = useState("");

  // Campaign State & Filtering
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthFlow && auth) {
      setAuthFlow(auth === "admin-login" ? "admin" : auth.startsWith("editor-") ? "editor" : "creator");
      setAuthMode(auth.endsWith("-login") ? "login" : "create");
      setAuthOpen(true);
    }
  }, [auth, isAuthFlow]);

  // Load campaigns from backend API
  useEffect(() => {
    api<CampaignCardData[]>("/campaigns")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data);
        } else {
          setCampaigns(fallbackCampaigns);
        }
      })
      .catch(() => {
        setCampaigns(fallbackCampaigns);
      });
  }, []);

  const applyField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNotice("");

    try {
      if (authMode === "create") {
        if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
          setAuthNotice("Please provide all required fields.");
          return;
        }

        const role = authFlow === "editor" ? "EDITOR" : "CREATOR";
        const fakeSupabaseId = "sb_" + Math.random().toString(36).substring(2, 11);
        const user = await authApi<UserSession>("/auth/register", {
          supabaseId: fakeSupabaseId,
          email: form.email.trim(),
          name: form.username.trim(),
          username: form.username.trim(),
          password: form.password,
          role,
        });

        localStorage.setItem("creatorflow-session", JSON.stringify(user));
        localStorage.setItem("creatorflow-token", "creatorflow_token_" + user.id);
        window.location.href = role === "EDITOR" ? "/editor" : "/creator";
      } else {
        const expectedRole = authFlow === "admin" ? "ADMIN" : authFlow === "editor" ? "EDITOR" : "CREATOR";
        const res = await authApi<{ token: string; user: UserSession }>("/auth/login", {
          username: form.username.trim(),
          password: form.password,
        });

        if (res.user.role !== expectedRole) {
          setAuthNotice(`This account is a ${res.user.role} account. Please choose the correct sign in section.`);
          return;
        }

        localStorage.setItem("creatorflow-session", JSON.stringify(res.user));
        localStorage.setItem("creatorflow-token", res.token);
        window.location.href = res.user.role === "ADMIN" ? "/admin/settings" : res.user.role === "EDITOR" ? "/editor" : "/creator";
      }
    } catch (error) {
      setAuthNotice(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory = selectedCategory === "ALL" || c.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesPlatform = selectedPlatform === "ALL" || c.socialPlatform.toUpperCase() === selectedPlatform.toUpperCase();
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  return (
    <>
      <PublicNav />
      <main>
        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-surface px-6 pb-20 pt-16 text-center md:pb-28 md:pt-24">
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_at_center,_rgba(23,52,92,0.12),_transparent_68%)]" />
          <div className="container relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-white/80 px-4 py-1.5 text-xs font-bold text-navy shadow-sm backdrop-blur mb-6">
              <Sparkles size={14} /> Performance Rewards Marketplace for Creators & Editors
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.06em] md:text-8xl">
              Grow campaigns.<br />
              <span className="text-navy">Reward editors.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              Creators post creative briefs with guaranteed gross rewards. Editors apply, edit viral cuts, publish, and receive transparent 85% payouts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/?auth=creator-create"
                className="rounded-full bg-navy px-6 py-3.5 font-bold text-white shadow-navy hover:opacity-95"
              >
                Launch a campaign <ArrowRight className="ml-1 inline" size={16} />
              </Link>
              <Link
                href="/?auth=editor-create"
                className="rounded-full border border-navy/20 bg-white px-6 py-3.5 font-bold text-neutral-800 hover:bg-neutral-50"
              >
                Join as Editor
              </Link>
            </div>
          </div>
        </section>

        {/* CAMPAIGN SHOWCASE & CARD VIEW (FEATURED BANNER + FILTER + CARDS) */}
        <section className="container py-10 md:py-14 space-y-8">
          {/* Top Featured Hero Banner (Inspired by user reference layout) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1626] via-[#17345c] to-[#0d213a] p-6 sm:p-8 text-white shadow-xl border border-white/10">
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-black text-white grid place-items-center">CF</div>
                  <span>Featured Campaign</span>
                  <span className="text-amber-400">✓</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Topps x Clipfarm • Viral Challenge
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">Campaign</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-300">811k views verified</span>
                  <span>•</span>
                  <span className="font-black text-white">₹85,000 editor pool</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/editor/campaigns"
                  className="rounded-full bg-white px-6 py-3 text-xs font-black text-navy shadow-lg hover:bg-neutral-100 text-center transition"
                >
                  View campaign
                </Link>
              </div>
            </div>

            {/* Subtle background glow effect */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-navy/40 blur-3xl" />
          </div>

          {/* Section Header: Campaigns for you > */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
                <Flame size={15} /> Open Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.05em] text-neutral-900 mt-1 flex items-center gap-2">
                <span>Campaigns for you</span>
                <span className="text-neutral-400 text-xl font-normal">&gt;</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Instagram and YouTube briefs with slot-based pools and verified view rewards.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-navy/15 bg-white py-2 pl-10 pr-4 text-xs font-medium outline-none focus:border-navy shadow-sm"
              />
            </div>
          </div>

          {/* Filter Pills (Category & Strictly Instagram/YouTube Platform) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-navy/10 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">Category:</span>
              {["ALL", "Tech", "Fashion", "Fitness", "Gaming", "Food"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                    selectedCategory.toUpperCase() === cat.toUpperCase()
                      ? "bg-navy text-white shadow-sm"
                      : "bg-white text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">Platform:</span>
              {["ALL", "Instagram", "YouTube"].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                    selectedPlatform.toUpperCase() === plat.toUpperCase()
                      ? "bg-navy text-white shadow-sm"
                      : "bg-surface text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {plat === "Instagram" ? "📸 Instagram" : plat === "YouTube" ? "▶ YouTube" : "All Platforms"}
                </button>
              ))}
            </div>
          </div>

          {/* CAMPAIGN CARD GRID */}
          {filteredCampaigns.length === 0 ? (
            <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center text-neutral-500">
              No campaigns match your filter. Try selecting All or clearing search.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCampaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          )}
        </section>

        {/* FINANCIAL TRANSPARENCY SECTION */}
        <section className="container py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-navy">Financial Model</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-5xl">
                Gross reward transparency with automatic ledger entries.
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-neutral-500">
                The campaign reward set by the creator is the gross amount. Upon verification and reward approval, the system allocates 85% directly to the editor&apos;s virtual wallet and 15% to the platform ledger.
              </p>
              <ul className="mt-8 space-y-4 text-sm font-semibold">
                {["Configurable 15% default platform fee", "Integer-based minor units (paise) preventing float drift", "Ledger-backed virtual wallet balances", "Instant balance updates upon post verification"].map((item) => (
                  <li key={item}><Check className="mr-3 inline text-navy" size={18} />{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] bg-gradient-to-br from-navy-soft via-white to-navy/10 p-8">
              <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-navy/10">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-neutral-600">Sample Campaign</span>
                  <span className="font-bold text-emerald-600">Reward Breakdown</span>
                </div>
                <p className="mt-6 text-4xl font-black tracking-[-0.06em] text-navy">₹1,000</p>
                <p className="text-xs text-neutral-400 mt-1">100,000 paise gross reward</p>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-navy-soft/60 px-4 py-3 text-sm">
                    <span className="font-medium text-neutral-700">Editor Wallet (+85%)</span>
                    <span className="font-bold text-emerald-600">₹850</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-navy-soft/40 px-4 py-3 text-sm">
                    <span className="font-medium text-neutral-700">Platform Ledger (+15%)</span>
                    <span className="font-semibold text-neutral-600">₹150</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-neutral-400">Questions</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em]">Frequently asked questions.</h2>
            <div className="mt-8 space-y-3 text-left">
              {faqs.map((faq, index) => (
                <details key={faq} open={index === 0} className="rounded-2xl border border-navy/10 bg-white p-5">
                  <summary className="cursor-pointer font-bold text-navy">{faq}</summary>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    CreatorFlow provides an intuitive end-to-end workflow: Campaign draft → Publish → Editor application → Submission review → Social publish → URL verification → Reward release with 15% platform fee deduction.
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-navy/10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-navy">CreatorFlow access</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                  {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Creator"} {authMode === "create" ? "account" : "login"}
                </h3>
              </div>
              <button onClick={() => setAuthOpen(false)} className="rounded-full bg-navy-soft p-2 text-navy">
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 flex rounded-full bg-navy-soft p-1 text-sm font-semibold text-neutral-700">
              <button
                className={`flex-1 rounded-full px-3 py-2 ${authMode === "create" ? "bg-white text-navy shadow" : ""}`}
                onClick={() => { setAuthMode("create"); setAuthNotice(""); }}
              >
                Create account
              </button>
              <button
                className={`flex-1 rounded-full px-3 py-2 ${authMode === "login" ? "bg-white text-navy shadow" : ""}`}
                onClick={() => { setAuthMode("login"); setAuthNotice(""); }}
              >
                Login
              </button>
            </div>

            {authNotice && (
              <p className="mb-4 rounded-2xl bg-navy-soft px-4 py-3 text-sm font-semibold text-navy">
                {authNotice}
              </p>
            )}

            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === "create" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-neutral-700">Email</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-navy/10 bg-navy-soft/20 px-3 py-3">
                    <Mail className="text-navy" size={18} />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => applyField("email", e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Username</span>
                <div className="flex items-center gap-2 rounded-2xl border border-navy/10 bg-navy-soft/20 px-3 py-3">
                  <CircleUserRound className="text-navy" size={18} />
                  <input
                    required
                    value={form.username}
                    onChange={(e) => applyField("username", e.target.value)}
                    placeholder={authFlow === "admin" ? "admin" : "johndoe"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-700">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-navy/10 bg-navy-soft/20 px-3 py-3">
                  <ShieldCheck className="text-navy" size={18} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => applyField("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
              </label>

              <button className="w-full rounded-2xl bg-navy px-4 py-3 font-bold text-white shadow-navy">
                {authMode === "create" ? "Join as " : "Sign in as "}
                {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Creator"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
