"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Play,
  Eye,
  Music,
} from "lucide-react";

export function HeroSectionExact() {
  return (
    <section className="relative isolate overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 bg-transparent transition-colors">

      {/* Ambient Background Gradients */}
      <div className="pointer-events-none absolute -left-20 top-0 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-indigo-100/30 to-indigo-100/10 blur-3xl dark:from-blue-900/15 dark:to-indigo-900/10" />

      <div className="pointer-events-none absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-purple-100/60 to-pink-100/25 blur-3xl dark:from-purple-900/15 dark:to-pink-900/10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">

          {/* LEFT COLUMN */}
          <div className="relative z-30 space-y-6 text-left lg:col-span-7">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-neutral-100/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-xs backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">

              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

              <span>Long videos in. Short clips out.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-black leading-[1.15] tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-5xl lg:text-[4.2rem]">

              Every great <br className="hidden sm:inline" />

              moment deserves <br className="hidden sm:inline" />

              a{" "}

              <span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text pb-1 pr-3.5 font-black italic text-transparent">
                second life
              </span>

            </h1>

            {/* Description */}
            <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">

              Got a long video, like a podcast or a talk? Editors on Reviral cut it into short clips and post them online. You set a budget and pay only for the views those clips really get.

            </p>

            {/* CTA BUTTONS */}
            <div className="relative z-50 flex flex-wrap items-center gap-3.5 pt-2">

              <Link
                href="/?auth=creator-create"
                id="hero-launch-campaign"
                className="relative z-50 inline-flex touch-manipulation items-center gap-2.5 rounded-full bg-[#0c142b] px-7 py-3.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-[#131f42] hover:shadow-2xl active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                <span>Launch Campaign</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/?auth=editor-create"
                id="hero-start-editing"
                className="relative z-50 inline-flex touch-manipulation items-center gap-2 rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-sm font-bold text-neutral-900 shadow-xs transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <span>Start Editing</span>
              </Link>

            </div>

            {/* TRUST BADGES */}
            <div className="relative z-30 flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-neutral-700 dark:text-neutral-300 sm:gap-8">

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-teal-600 dark:text-teal-400"
                />
                <span>100% Verified Views</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp
                  size={16}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />
                <span>85% Editor Payouts</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="shrink-0 text-purple-600 dark:text-purple-400"
                />
                <span>Escrow Protection</span>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN - HERO VISUAL */}
          <div className="relative z-0 mt-6 flex items-center justify-center pointer-events-none lg:col-span-5 lg:mt-0">

            {/* Main Visual Container */}
            <div className="relative flex aspect-[4/5] w-full max-w-[420px] items-center justify-center">

              {/* Purple Background Shape */}
              <div className="absolute inset-x-4 inset-y-2 rotate-3 transform rounded-[44px] bg-gradient-to-tr from-[#cfc3f8] via-[#bfabf7] to-[#a78bfa] shadow-2xl dark:from-[#3a2f64] dark:to-[#4e3a8c] dark:shadow-purple-950/40" />

              {/* Podcaster Image */}
              <div className="relative z-10 h-[92%] w-[88%] overflow-hidden rounded-[38px] border border-white/40 bg-neutral-900 shadow-xl dark:border-white/10">

                <img
                  src="/hero_podcaster.jpg"
                  alt="Creator podcasting with microphone"
                  className="h-full w-full object-cover object-top"
                  draggable={false}
                />

              </div>

              {/* Decorative Burst */}
              <div className="pointer-events-none absolute -top-3 right-2 z-30 text-neutral-900 dark:text-white sm:right-4">

                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 34 34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M7 14L2 8" />
                  <path d="M18 10L18 2" />
                  <path d="M28 14L33 8" />
                </svg>

              </div>

              {/* Floating Phone Mockup */}
              <div className="pointer-events-none absolute -right-2 top-12 z-20 aspect-[9/18] w-[180px] rotate-6 rounded-[34px] border-4 border-neutral-900/90 bg-neutral-950 p-2 shadow-2xl transition-transform duration-300 sm:-right-8 sm:w-[205px] sm:hover:rotate-3">

                {/* Phone Screen */}
                <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-black">

                  <img
                    src="/phone_concert.jpg"
                    alt="Viral concert short clip"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />

                  {/* Music Icon */}
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md">

                    <Music size={11} />

                  </div>

                  {/* Play Button */}
                  <div className="pointer-events-none absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/40 text-white shadow-lg backdrop-blur-md">

                    <Play
                      size={18}
                      className="translate-x-0.5 fill-current"
                    />

                  </div>

                  {/* Views Badge */}
                  <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-md">

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