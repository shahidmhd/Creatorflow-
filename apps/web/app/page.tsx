"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CircleUserRound,
  Mail,
  ShieldCheck,
  X,
  Play,
  Eye,
  IndianRupee,
  Scissors,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Footer, PublicNav, CampaignCard, CampaignCardData } from "./components";
import { authApi, api, UserSession, setAuthData } from "./api";

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
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
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
    deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
    creator: { name: "Neon Byte", username: "neonbyte" },
  },
  {
    id: "c-3",
    title: "High-Intensity Fitness Transformation Reel",
    description: "Sync motivational voiceovers with workout montage clips and bass-heavy audio.",
    thumbnail: null,
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
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
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
    deadline: new Date(Date.now() + 86400000 * 6).toISOString(),
    creator: { name: "Apex Pulse", username: "apexpulse" },
  },
];

/* ─── FAQ data ───────────────────────────────────────────── */
const faqs = [
  {
    q: "How much does Reviral charge?",
    a: "Reviral keeps 15% of every verified payout. If a clip gets no views, it costs nothing. You only pay for real, verified views.",
  },
  {
    q: "How do brands launch and fund campaigns?",
    a: "Sign up as a brand, create a campaign brief, set your budget and view rate (e.g. ₹200 per 1,000 views). Editors apply, create clips, and post them. You're charged only when views are verified.",
  },
  {
    q: "How are editor payouts calculated?",
    a: "Your verified views × your campaign's rate per 1,000 = gross payout. Reviral deducts 15% and the rest goes straight to your wallet.",
  },
  {
    q: "Can an editor resubmit content after feedback?",
    a: "Yes. Brands can request changes with a written note. Editors revise and resubmit. Only SUBMITTED content that gets approved moves to the publishing stage.",
  },
];

/* ─── Page shell ─────────────────────────────────────────── */
export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" aria-busy="true" />}>
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
    auth === "admin-login";

  const initialFlow = getFlowFromParam(auth);
  const [authOpen, setAuthOpen] = useState(isAuthFlow);
  const [authMode, setAuthMode] = useState<"create" | "login">(
    initialFlow === "admin" ? "login" : auth?.endsWith("-login") ? "login" : "create"
  );
  const [authFlow, setAuthFlow] = useState<"creator" | "editor" | "admin">(initialFlow);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [authNotice, setAuthNotice] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (isAuthFlow && auth) {
      const flow = getFlowFromParam(auth);
      setAuthFlow(flow);
      setAuthMode(flow === "admin" ? "login" : auth.endsWith("-login") ? "login" : "create");
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
    <>
      <PublicNav />
      <main>

        {/* ══════════════════════════════════════════════════
            HERO — Single Image Multi-Step Product Workflow
        ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white px-6 py-14 md:py-20 border-b border-neutral-100">
          <div className="container max-w-7xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left: Value Proposition & CTAs */}
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-navy/5 border border-navy/15 px-3.5 py-1 text-xs font-black uppercase tracking-[.18em] text-navy mb-4">
                  <Sparkles size={13} className="text-navy" />
                  Long videos in. Short clips out.
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.02] tracking-[-0.04em] text-neutral-900">
                  Every great moment deserves a second&nbsp;life.
                </h1>
                <p className="mt-5 text-base md:text-lg leading-relaxed text-neutral-600">
                  Got a long video, like a podcast or a talk? Skilled editors on Reviral cut it into high-converting 9:16 short clips. You set a budget and pay only for verified views those clips actually get.
                </p>

                {/* Primary Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/?auth=creator-create"
                    id="cta-footage"
                    className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-black text-white hover:bg-navy/90 hover:shadow-md active:scale-[0.98] transition-all"
                  >
                    I have footage <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/?auth=editor-create"
                    id="cta-edit"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-sm font-black text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.98] transition-all"
                  >
                    I want to edit <Scissors size={14} className="text-neutral-500" />
                  </Link>
                </div>

                {/* Trust & Transparency Badges */}
                <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>100% Verified Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-navy" />
                    <span>85% Editor Payouts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-navy" />
                    <span>Escrow Protection</span>
                  </div>
                </div>
              </div>

              {/* Right: Single Image Multi-Step Product Workflow */}
              <div className="lg:col-span-7">
                <div className="relative group overflow-hidden rounded-2xl bg-[#0B1528] border border-navy/20 shadow-2xl transition-all duration-300 hover:border-navy/40">
                  {/* Mockup browser/app header bar */}
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#08101E]/90 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
                      </div>
                      <span className="ml-2 text-[11px] font-semibold text-white/50 tracking-wider uppercase">
                        Reviral Workflow Engine
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      End-to-End Pipeline
                    </div>
                  </div>

                  {/* The multi-step infographic */}
                  <div className="relative bg-[#0B1528] p-1.5">
                    <Image
                      src="/reviral_product_workflow.jpg"
                      alt="Reviral Complete Product Workflow: Step 1 Long Video In, Step 2 Editor Network creates clips, Step 3 Verified Views & Payouts"
                      width={960}
                      height={720}
                      className="w-full h-auto object-cover rounded-xl"
                      priority
                    />
                  </div>

                  {/* Bottom step indicators */}
                  <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-[#08101E] py-2.5 px-3 text-center">
                    <div className="px-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-400">Step 01</p>
                      <p className="text-xs font-bold text-white truncate">Long Video In</p>
                    </div>
                    <div className="px-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Step 02</p>
                      <p className="text-xs font-bold text-white truncate">Editors Cut Shorts</p>
                    </div>
                    <div className="px-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Step 03</p>
                      <p className="text-xs font-bold text-emerald-300 truncate">Pay Only for Views</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            OPEN CAMPAIGNS
        ══════════════════════════════════════════════════ */}
        <section className="bg-surface py-16 md:py-20">
          <div className="container">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-navy mb-1">Live now</p>
                <h2 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Open campaigns</h2>
                <p className="text-sm text-neutral-500 mt-1">Apply, edit, post, and earn from real&nbsp;views.</p>
              </div>
              <Link href="/?auth=editor-create" className="text-xs font-bold text-navy hover:underline flex items-center gap-1">
                Browse all <ArrowRight size={12} />
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
            HOW IT WORKS — 3 visual cards with images
        ══════════════════════════════════════════════════ */}
        <section className="bg-surface py-16 md:py-20">
          <div className="container">
            <p className="text-center text-xs font-black uppercase tracking-[.2em] text-navy mb-2">How it works</p>
            <h2 className="text-center text-3xl md:text-4xl font-black tracking-[-0.05em] mb-12">
              Three simple steps.
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Step 1 — with video image */}
              <div className="rounded-2xl border border-navy/10 bg-white shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white">
                      <Play size={20} />
                    </span>
                    <span className="text-4xl font-black text-neutral-100 leading-none">01</span>
                  </div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-900 mb-2">Brand posts footage</h3>
                  <p className="text-sm leading-6 text-neutral-500">
                    Upload your long podcast, event recording, or product video. Set your per-view rate and total budget.
                  </p>
                </div>
                <Image
                  src="/how_step1_video.webp"
                  alt="Long video timeline with highlighted best moments"
                  width={520}
                  height={200}
                  className="w-full object-cover"
                />
              </div>

              {/* Step 2 — with clips image */}
              <div className="rounded-2xl border border-navy/10 bg-white shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white">
                      <Scissors size={20} />
                    </span>
                    <span className="text-4xl font-black text-neutral-100 leading-none">02</span>
                  </div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-900 mb-2">Editors create short clips</h3>
                  <p className="text-sm leading-6 text-neutral-500">
                    Skilled editors apply, cut the best moments, and publish them across Instagram &amp; YouTube.
                  </p>
                </div>
                <Image
                  src="/how_step2_clips.webp"
                  alt="Three video clips with view counts and earnings"
                  width={520}
                  height={180}
                  className="w-full object-cover"
                />
              </div>

              {/* Step 3 — with payout image */}
              <div className="rounded-2xl border border-navy/10 bg-white shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white">
                      <IndianRupee size={20} />
                    </span>
                    <span className="text-4xl font-black text-neutral-100 leading-none">03</span>
                  </div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-900 mb-2">Pay only for real views</h3>
                  <p className="text-sm leading-6 text-neutral-500">
                    Views are verified. Editors earn 85% of the payout. You pay nothing for clips that don&apos;t perform.
                  </p>
                </div>
                <Image
                  src="/how_step3_payout.webp"
                  alt="Budget progress bar showing paid out views"
                  width={520}
                  height={140}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TRANSPARENT MATH
        ══════════════════════════════════════════════════ */}
        <section className="bg-white py-20 md:py-24">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              {/* Left */}
              <div>
                <p className="text-sm font-black uppercase tracking-[.2em] text-navy mb-4">The math, made simple</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-[-0.06em] leading-[0.95] mb-6">
                  No hidden cut.<br />Here is the whole math.
                </h2>
                <p className="text-base leading-7 text-neutral-500 max-w-md">
                  Editors keep <strong className="text-neutral-800">85%</strong> of every payout.
                  Reviral keeps <strong className="text-neutral-800">15%</strong>. You can see the split on
                  every single payment.
                </p>
                <ul className="mt-8 space-y-3 text-sm font-semibold text-neutral-700">
                  {[
                    "No monthly fees — pay only for verified views",
                    "Paise-precise ledger, no float drift",
                    "Instant wallet update after post verification",
                    "Full transaction history for every campaign",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 shrink-0 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Eye size={11} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: payout card */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-navy/25 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="grid h-7 w-7 place-items-center rounded-lg border border-navy/15 text-navy">
                      <IndianRupee size={14} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Example payout</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">7,500 verified views at ₹200 per 1,000</span>
                      <span className="font-bold text-neutral-900">₹1,500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Reviral fee (15%)</span>
                      <span className="font-bold text-neutral-500">₹225</span>
                    </div>
                    <div className="h-px bg-neutral-200 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-black text-neutral-900 text-base">Editor receives</span>
                      <span className="font-black text-2xl text-navy">₹1,275</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual CTA cards */}
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-navy p-8 text-white">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/50 mb-4">For brands and podcasters</p>
                <h3 className="text-2xl font-black tracking-[-0.04em] mb-3">
                  Pay only for views that actually happen.
                </h3>
                <p className="text-sm leading-6 text-white/60 mb-8">
                  Put your long content in front of hundreds of editors. If a clip gets no views, it costs you nothing.
                </p>
                <Link
                  href="/?auth=creator-create"
                  id="cta-brand-campaign"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition"
                >
                  Start a campaign <ArrowRight size={14} />
                </Link>
              </div>
              <div className="rounded-2xl border border-navy/15 bg-white p-8">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-navy/50 mb-4">For editors</p>
                <h3 className="text-2xl font-black tracking-[-0.04em] text-neutral-900 mb-3">
                  Turn your editing skill into steady income.
                </h3>
                <p className="text-sm leading-6 text-neutral-500 mb-8">
                  Pick a campaign in your niche, cut, post, and watch earnings build with every view.
                </p>
                <Link
                  href="/?auth=editor-create"
                  id="cta-editor-earn"
                  className="inline-flex items-center gap-2 rounded-full border border-navy/25 bg-white px-5 py-2.5 text-sm font-bold text-navy hover:bg-navy-soft transition"
                >
                  Start earning <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        <section className="bg-white py-20 md:py-24">
          <div className="container max-w-2xl mx-auto">
            <p className="text-center text-xs font-black uppercase tracking-[.2em] text-neutral-400 mb-2">Questions</p>
            <h2 className="text-center text-4xl font-black tracking-[-0.06em] mb-10">
              Frequently asked questions.
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-navy/10 bg-white overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-navy text-sm hover:bg-neutral-50 transition"
                  >
                    {faq.q}
                    <span className={`ml-4 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>
                      <ArrowRight size={14} />
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-5 text-sm leading-6 text-neutral-500">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════
          AUTH MODAL
      ══════════════════════════════════════════════════ */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-navy/10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-navy">Reviral access</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                  {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Brand"}{" "}
                  {authMode === "create" ? "account" : "login"}
                </h3>
              </div>
              <button onClick={() => setAuthOpen(false)} className="rounded-full bg-navy-soft p-2 text-navy">
                <X size={16} />
              </button>
            </div>

            {authFlow !== "admin" && (
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
            )}



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
                {authFlow === "admin" ? "Admin" : authFlow === "editor" ? "Editor" : "Brand"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
