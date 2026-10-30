"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Play, Eye, Music } from "lucide-react";

export function HeroSectionExact() {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 bg-transparent transition-colors">
      {/* Subtle Ambient Radial Gradients */}
      <div className="pointer-events-none absolute -left-20 top-0 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-blue-100/50 to-indigo-100/30 blur-3xl dark:from-blue-900/15 dark:to-indigo-900/10" />
      <div className="pointer-events-none absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-purple-100/60 to-pink-100/25 blur-3xl dark:from-purple-900/15 dark:to-pink-900/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* ══════════════════════════════════════════════════
              LEFT COLUMN: HEADLINE, COPY, BUTTONS, BADGES
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-neutral-100/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 backdrop-blur-sm shadow-xs">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Long videos in. Short clips out.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black tracking-[-0.03em] leading-[1.15] text-neutral-950 dark:text-white">
              Every great <br className="hidden sm:inline" />
              moment deserves <br className="hidden sm:inline" />
              a{" "}
              <span className="italic font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block pr-3.5 -mr-3.5 pb-1">
                second life
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-lg leading-relaxed font-medium">
              Got a long video, like a podcast or a talk? Editors on Reviral cut it into short clips and post them online. You set a budget and pay only for the views those clips really get.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/?auth=creator-create"
                id="hero-launch-campaign"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#0c142b] hover:bg-[#131f42] text-white px-7 py-3.5 text-sm font-bold shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                <span>Launch Campaign</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/?auth=editor-create"
                id="hero-start-editing"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 px-7 py-3.5 text-sm font-bold text-neutral-900 shadow-xs active:scale-[0.98] transition-all dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <span>Start Editing</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>100% Verified Views</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>85% Editor Payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Escrow Protection</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT COLUMN: PODCASTER + TILTED PHONE + DOODLE
          ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 relative flex justify-center items-center mt-6 lg:mt-0">
            {/* The Main Container */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
              {/* Soft Purple Rounded Backdrop (slanted background shape) */}
              <div className="absolute inset-x-4 inset-y-2 rounded-[44px] bg-gradient-to-tr from-[#cfc3f8] via-[#bfabf7] to-[#a78bfa] shadow-2xl rotate-3 transform dark:from-[#3a2f64] dark:to-[#4e3a8c] dark:shadow-purple-950/40" />

              {/* Podcaster Photo Frame */}
              <div className="relative z-10 w-[88%] h-[92%] rounded-[38px] overflow-hidden shadow-xl border border-white/40 dark:border-white/10 bg-neutral-900">
                <img
                  src="/hero_podcaster.jpg"
                  alt="Creator podcasting with microphone"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Floating Hand-Drawn Burst Doodle above Phone */}
              <div className="absolute -top-3 right-2 sm:right-4 z-30 pointer-events-none text-neutral-900 dark:text-white">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M7 14L2 8" />
                  <path d="M18 10L18 2" />
                  <path d="M28 14L33 8" />
                </svg>
              </div>

              {/* Floating 3D Angled Smartphone Mockup */}
              <div className="absolute -right-2 sm:-right-8 top-12 z-20 w-[180px] sm:w-[205px] aspect-[9/18] rounded-[34px] bg-neutral-950 p-2 shadow-2xl border-4 border-neutral-900/90 rotate-6 hover:rotate-3 transition-transform duration-300">
                {/* Dynamic Screen Inner */}
                <div className="relative h-full w-full rounded-[26px] overflow-hidden bg-black">
                  <img
                    src="/phone_concert.jpg"
                    alt="Viral concert short clip"
                    className="h-full w-full object-cover"
                  />

                  {/* Top Right Social Music Icon */}
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white text-[11px] border border-white/20">
                    <Music size={11} />
                  </div>

                  {/* Center Frosted Glass Play Button */}
                  <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-lg pointer-events-none">
                    <Play size={18} className="fill-current translate-x-0.5" />
                  </div>

                  {/* Bottom Left View Count Badge */}
                  <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-white border border-white/15">
                    <Eye size={12} className="text-white" />
                    <span>1.2M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
