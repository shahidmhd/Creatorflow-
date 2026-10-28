"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CircleUserRound,
  Mail,
  ShieldCheck,
  X,
  Eye,
  IndianRupee,
  Scissors,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Footer, PublicNav, CampaignCard, CampaignCardData } from "./components";
import { authApi, api, UserSession, setAuthData } from "./api";
import { NeuralBackground } from "./landing-components/NeuralBackground";
import { FloatingSocialBadges } from "./landing-components/FloatingSocialBadges";
import { HeroThreeStepWorkflow } from "./landing-components/HeroThreeStepWorkflow";
import { InteractivePayoutCalculator } from "./landing-components/InteractivePayoutCalculator";

/* ─── Fallback campaign data ─────────────────────────────── */
const fallbackCampaigns: CampaignCardData[] = [
  {
    id: "c-1",
    title: "Summer Viral Reels Challenge",
    description: "Produce dynamic 9:16 vertical edits featuring fast-paced hooks and aesthetic typography.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    category: "Fashion",
    socialPlatform: "Instagram",
    campaignFund: 100000,
    rewardAmount: 100000,
    editorSlots: 10,
    maximumEditorEarning: 8500,
    earningPer1000Views: 850,
    minimumViews: 10000,
    approvedEditorsCount: 7,
    remainingSlots: 3,
    deadline: "2026-11-05T00:00:00.000Z",
    creator: { name: "Aria Studio", username: "ariastudio" },
  },
  {
    id: "c-2",
    title: "Next-Gen Tech Gadget Unboxing Short",
    description: "Snappy high-retention product unboxings highlighting specs and punchy transitions.",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60",
    category: "Tech",
    socialPlatform: "YouTube",
    campaignFund: 250000,
    rewardAmount: 250000,
    editorSlots: 5,
    maximumEditorEarning: 42500,
    earningPer1000Views: 1500,
    minimumViews: 25000,
    approvedEditorsCount: 2,
    remainingSlots: 3,
    deadline: "2026-11-08T00:00:00.000Z",
    creator: { name: "Neon Byte", username: "neonbyte" },
  },
  {
    id: "c-3",
    title: "High-Intensity Fitness Transformation Reel",
    description: "Sync motivational voiceovers with workout montage clips and bass-heavy audio.",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60",
    category: "Fitness",
    socialPlatform: "Instagram",
    campaignFund: 150000,
    rewardAmount: 150000,
    editorSlots: 8,
    maximumEditorEarning: 15937,
    earningPer1000Views: 1200,
    minimumViews: 12000,
    approvedEditorsCount: 4,
    remainingSlots: 4,
    deadline: "2026-11-04T00:00:00.000Z",
    creator: { name: "FitPulse Media", username: "fitpulse" },
  },
  {
    id: "c-4",
    title: "Epic Gaming Highlights & Montage Series",
    description: "Transform raw stream VODs into viral YouTube Shorts with kinetic zoom-ins.",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
    category: "Gaming",
    socialPlatform: "YouTube",
    campaignFund: 180000,
    rewardAmount: 180000,
    editorSlots: 6,
    maximumEditorEarning: 25500,
    earningPer1000Views: 1000,
    minimumViews: 20000,
    approvedEditorsCount: 1,
    remainingSlots: 5,
    deadline: "2026-11-06T00:00:00.000Z",
    creator: { name: "Apex Pulse", username: "apexpulse" },
  },
];

/* ─── FAQ data ───────────────────────────────────────────── */
const faqs = [
  {
    q: "How does the 3-step workflow work?",
    a: "Brands deposit footage and fund an escrow pool. Certified editors apply and cut 9:16 vertical clips. When clips are published, our verification engine tracks views and releases 85% directly to editor wallets.",
  },
  {
    q: "How much does Reviral charge?",
    a: "Reviral retains 15% of verified payouts. If a clip gets no views, it costs nothing. Brands only pay for real, verified views.",
  },
  {
    q: "How do brands launch and fund campaigns?",
    a: "Sign up as a brand, create a campaign brief, set your budget and view rate (e.g. ₹200 per 1,000 views). Editors apply, create clips, and post them with approved hashtags and mentions.",
  },
  {
    q: "How are editor payouts calculated?",
    a: "Your verified views × your campaign rate per 1,000 = gross payout. Reviral deducts 15% platform fee and credits 85% straight to your wallet.",
  },
];

/* ─── Page shell ─────────────────────────────────────────── */
export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper dark:bg-[#070b14]" aria-busy="true" />}>
      <HomeContent />
    </Suspense>
  );
}

/* ─── Main content ───────────────────────────────────────── */
function getFlowFromParam(param: string | null): "creator" | "editor" | "admin" {
  if (param === "admin-login") return "admin";
  if (param?.startsWith("editor-") || param?.startsWith("clipper-")) return "editor";
  return "creator";
}

function HomeContent() {
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");
  const isAuthFlow =
    auth === "creator-login" || auth === "creator-create" ||
    auth === "editor-login" || auth === "editor-create" ||
    auth === "brand-login" || auth === "brand-create" ||
    auth === "clipper-login" || auth === "clipper-create" ||
    auth === "admin-login" || auth === "login" || auth === "signin";

  const initialFlow = getFlowFromParam(auth);
  const [authOpen, setAuthOpen] = useState(isAuthFlow);
  const [authMode, setAuthMode] = useState<"create" | "login">(
    initialFlow === "admin" ? "login" : auth?.endsWith("-login") || auth === "login" || auth === "signin" ? "login" : "create"
  );
  const [authFlow, setAuthFlow] = useState<"creator" | "editor" | "admin">(initialFlow);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [authNotice, setAuthNotice] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: "create" | "login"; flow?: "creator" | "editor" | "admin" }>;
      if (customEvent.detail?.mode) setAuthMode(customEvent.detail.mode);
      if (customEvent.detail?.flow) setAuthFlow(customEvent.detail.flow);
      setAuthNotice("");
      setAuthOpen(true);
    };
    window.addEventListener("open-auth", handleOpenAuth);
    return () => window.removeEventListener("open-auth", handleOpenAuth);
  }, []);

  useEffect(() => {
    if (isAuthFlow && auth) {
      const flow = getFlowFromParam(auth);
      setAuthFlow(flow);
      setAuthMode(flow === "admin" ? "login" : auth.endsWith("-login") || auth === "login" || auth === "signin" ? "login" : "create");
      setAuthOpen(true);
    }
  }, [auth, isAuthFlow]);

  useEffect(() => {
    api<CampaignCardData[]>("/campaigns")
      .then((data) => setCampaigns(Array.isArray(data) && data.length > 0 ? data : fallbackCampaigns))
      .catch(() => setCampaigns(fallbackCampaigns));
  }, []);

  const applyField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
        const token = "creatorflow_token_" + user.id;
        setAuthData(token, user);
        window.location.href = role === "EDITOR" ? "/editor" : "/creator";
      } else {
        const expectedRole = authFlow === "admin" ? "ADMIN" : authFlow === "editor" ? "EDITOR" : "CREATOR";
        const res = await authApi<{ token: string; user: UserSession }>("/auth/login", {
          username: form.username.trim(),
          password: form.password,
        });
        if (res.user.role !== expectedRole) {
          setAuthNotice(`This is a ${res.user.role} account. Please use the correct sign-in section.`);
          return;
        }
        setAuthData(res.token, res.user);
        window.location.href =
          res.user.role === "ADMIN" ? "/admin/settings" :
            res.user.role === "EDITOR" ? "/editor" : "/creator";
      }
    } catch (error) {
      setAuthNotice(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-paper dark:bg-[#070b14] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <PublicNav />

      <main className="relative overflow-hidden">
        {/* ══════════════════════════════════════════════════
            HERO SECTION WITH NEURAL BACKGROUND & 3-STEP PIPELINE
        ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden px-4 sm:px-6 py-16 md:py-24 border-b border-black/5 dark:border-white/5">
          {/* Animated Neural Synapse Canvas Background */}
          <NeuralBackground />

          {/* Floating 3D Instagram & YouTube Badges */}
          <FloatingSocialBadges />

          <div className="container relative z-10 max-w-6xl mx-auto text-center">
            {/* Pill Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold tracking-wide text-cyan-700 dark:text-cyan-400 mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-cyan-500" />
              Long videos in. Short clips out.
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black leading-[1.04] tracking-[-0.04em] text-neutral-900 dark:text-white max-w-4xl mx-auto">
              Every great <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500 bg-clip-text text-transparent">
                moment deserves a second life.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg md:text-xl leading-relaxed text-neutral-600 dark:text-neutral-200 max-w-2xl mx-auto font-medium">
              Got a long video, like a podcast or a talk? Editors on Reviral cut it into short clips and post them online. You set a budget and pay only for the views those clips really get.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/?auth=creator-create"
                id="cta-footage"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-navy px-8 py-4 text-sm font-black text-white hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Launch Campaign <ArrowRight size={16} />
              </Link>
              <Link
                href="/?auth=editor-create"
                id="cta-edit"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 dark:border-white/10 dark:bg-white/5 px-8 py-4 text-sm font-black text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-[0.98] transition-all backdrop-blur-md"
              >
                Start Editing
              </Link>
            </div>

            {/* Trust Badges Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs font-bold text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>100% Verified Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee size={15} className="text-cyan-500" />
                <span>85% Editor Payouts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-violet-500" />
                <span>Escrow Protection</span>
              </div>
            </div>

            {/* ─── 3-STEP WORKFLOW PIPELINE CARDS ───────────── */}
            <HeroThreeStepWorkflow />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            LIVE CAMPAIGNS MARKETPLACE
        ══════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 border-b border-black/5 dark:border-white/5">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400 mb-1">Live Marketplace</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
                  Open Campaigns
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Apply, edit, post, and earn from real verified views.
                </p>
              </div>
              <Link
                href="/?auth=editor-create"
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                Browse all campaigns <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {campaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            INTERACTIVE PAYOUT CALCULATOR
        ══════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 border-b border-black/5 dark:border-white/5 bg-surface/40 dark:bg-black/20">
          <div className="container max-w-6xl mx-auto">
            <InteractivePayoutCalculator />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            DUAL CALL TO ACTION
        ══════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 border-b border-black/5 dark:border-white/5">
          <div className="container max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              {/* For Brands */}
              <div id="for-brands" className="rounded-3xl bg-gradient-to-br from-navy via-navy-strong to-[#081220] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-cyan-400 mb-3">For Brands & Creators</p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] mb-4">
                  Pay only for views that actually happen.
                </h3>
                <p className="text-sm leading-relaxed text-white/70 mb-8 max-w-md">
                  Put your long-form videos in front of hundreds of talented editors. If a clip gets no views, it costs you nothing.
                </p>
                <Link
                  href="/?auth=creator-create"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black text-navy shadow-md hover:bg-neutral-100 transition"
                >
                  Start a campaign <ArrowRight size={14} />
                </Link>
              </div>

              {/* For Editors */}
              <div id="for-creators" className="glass-card rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-violet-600 dark:text-violet-400 mb-3">For Editors & Clippers</p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] text-neutral-900 dark:text-white mb-4">
                  Turn your editing skill into steady income.
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
                  Pick a campaign in your favorite niche, cut, post, and watch verified earnings deposit straight into your wallet.
                </p>
                <Link
                  href="/?auth=editor-create"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-xs font-black text-neutral-900 shadow-sm hover:bg-neutral-50 dark:border-white/10 dark:bg-white/10 dark:text-white transition"
                >
                  Start earning <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FAQ SECTION
        ══════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28">
          <div className="container max-w-2xl mx-auto">
            <p className="text-center text-xs font-black uppercase tracking-[.2em] text-neutral-400 mb-2">Questions</p>
            <h2 className="text-center text-3xl sm:text-4xl font-black tracking-[-0.05em] mb-10 text-neutral-900 dark:text-white">
              Frequently Asked Questions.
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-neutral-900 dark:text-white text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    {faq.q}
                    <span className={`ml-4 shrink-0 transition-transform duration-200 text-neutral-400 ${openFaq === i ? "rotate-180" : ""}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 border-t border-black/5 dark:border-white/5 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════
          AUTHENTICATION MODAL
      ══════════════════════════════════════════════════ */}
      {authOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAuthOpen(false);
              if (typeof window !== "undefined" && window.location.search) {
                window.history.replaceState(null, "", window.location.pathname);
              }
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md"
        >
          <div className="glass-card w-full max-w-md rounded-[28px] p-6 shadow-2xl ring-1 ring-white/10 dark:bg-[#0c1829]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600 dark:text-cyan-400">Reviral access</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
                  {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Brand"}{" "}
                  {authMode === "create" ? "Sign up" : "Sign in"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAuthOpen(false);
                  if (typeof window !== "undefined" && window.location.search) {
                    window.history.replaceState(null, "", window.location.pathname);
                  }
                }}
                className="rounded-full bg-neutral-100 dark:bg-white/10 p-2 text-neutral-600 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition"
              >
                <X size={16} />
              </button>
            </div>

            {authFlow !== "admin" && (
              <div className="mb-5 flex rounded-full bg-neutral-100 dark:bg-white/10 p-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <button
                  type="button"
                  className={`flex-1 rounded-full px-3 py-1.5 transition-all ${authMode === "login"
                    ? "bg-white dark:bg-[#152a45] text-neutral-900 dark:text-white shadow font-bold"
                    : "hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  onClick={() => { setAuthMode("login"); setAuthNotice(""); }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full px-3 py-1.5 transition-all ${authMode === "create"
                    ? "bg-white dark:bg-[#152a45] text-neutral-900 dark:text-white shadow font-bold"
                    : "hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  onClick={() => { setAuthMode("create"); setAuthNotice(""); }}
                >
                  Create account
                </button>
              </div>
            )}

            {authNotice && (
              <p className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {authNotice}
              </p>
            )}

            <form onSubmit={submitAuth} className="space-y-4">
              {authMode === "create" && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Email</span>
                  <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                    <Mail className="text-neutral-400" size={16} />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => applyField("email", e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Username</span>
                <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                  <CircleUserRound className="text-neutral-400" size={16} />
                  <input
                    required
                    value={form.username}
                    onChange={(e) => applyField("username", e.target.value)}
                    placeholder={authFlow === "admin" ? "admin" : "johndoe"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500">Password</span>
                <div className="flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                  <ShieldCheck className="text-neutral-400" size={16} />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => applyField("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                  />
                </div>
              </label>

              <button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-navy py-3 font-bold text-white hover:opacity-95 transition">
                {authMode === "create" ? "Join as " : "Sign in as "}
                {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Brand"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
