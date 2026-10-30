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
  Play,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Footer, PublicNav, CampaignCard, CampaignCardData } from "./components";
import { authApi, api, UserSession, setAuthData } from "./api";
import { HeroSectionExact } from "./landing-components/HeroSectionExact";
import { WorkflowStepCards } from "./landing-components/WorkflowStepCards";
import { OpenCampaignsBanner } from "./landing-components/OpenCampaignsBanner";
import { SplitAudienceCards } from "./landing-components/SplitAudienceCards";
import { FaqSectionExact } from "./landing-components/FaqSectionExact";
import { NeuralBackground } from "./landing-components/NeuralBackground";

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
    <div className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#070b14] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* ─── FLOATING NEURAL SYNAPSE BACKGROUND ─── */}
      <NeuralBackground />

      <PublicNav />

      <main className="relative z-10 overflow-hidden">
        {/* ══════════════════════════════════════════════════
            1. HERO SECTION (REFERENCE EXACT)
        ══════════════════════════════════════════════════ */}
        <HeroSectionExact />

        {/* ══════════════════════════════════════════════════
            2. 3-STEP WORKFLOW CARDS: 01, 02, 03
        ══════════════════════════════════════════════════ */}
        <div id="how-it-works">
          <WorkflowStepCards />
        </div>

        {/* ══════════════════════════════════════════════════
            3. LIVE MARKETPLACE: OPEN CAMPAIGNS & CAMPAIGNS LIST
        ══════════════════════════════════════════════════ */}
        <section id="campaigns" className="py-10 lg:py-16 bg-transparent transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Open Campaigns Banner */}
            <OpenCampaignsBanner />

            {/* Live Campaign Cards Grid */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                    Live Open Campaigns
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                    Select a brief, download raw footage, and earn verified view payouts.
                  </p>
                </div>
                <Link
                  href="/?auth=editor-create"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline shrink-0"
                >
                  <span>Browse all campaigns ({campaigns.length})</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {campaigns.map((camp) => (
                  <CampaignCard key={camp.id} campaign={camp} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            4. FOR BRANDS & CREATORS / FOR EDITORS & CLIPPERS
        ══════════════════════════════════════════════════ */}
        <SplitAudienceCards />

        {/* ══════════════════════════════════════════════════
            5. FREQUENTLY ASKED QUESTIONS
        ══════════════════════════════════════════════════ */}
        <div id="pricing">
          <FaqSectionExact />
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

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
          <div className="glass-card w-full max-w-md rounded-[28px] p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 dark:bg-[#0c1829]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">Reviral access</p>
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
                className="rounded-full bg-neutral-100 dark:bg-white/10 p-2 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition"
              >
                <X size={16} />
              </button>
            </div>

            {authFlow !== "admin" && (
              <div className="mb-5 flex rounded-full bg-neutral-100 dark:bg-white/10 p-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <button
                  type="button"
                  className={`flex-1 rounded-full px-3 py-1.5 transition-all ${authMode === "login"
                    ? "bg-[#0a1128] text-white shadow font-bold dark:bg-white dark:text-black"
                    : "hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  onClick={() => { setAuthMode("login"); setAuthNotice(""); }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full px-3 py-1.5 transition-all ${authMode === "create"
                    ? "bg-[#0a1128] text-white shadow font-bold dark:bg-white dark:text-black"
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
                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                    <Mail className="text-blue-600 dark:text-blue-400" size={16} />
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
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                  <CircleUserRound className="text-blue-600 dark:text-blue-400" size={16} />
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
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-2.5">
                  <ShieldCheck className="text-blue-600 dark:text-blue-400" size={16} />
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

              <button className="w-full rounded-full bg-[#0a1128] hover:bg-[#101c3b] dark:bg-white dark:text-neutral-950 py-3 font-bold text-white transition shadow-lg">
                {authMode === "create" ? "Join as " : "Sign in as "}
                {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Brand"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
