"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function OpenCampaignsBanner() {
  return (
    <div className="relative rounded-[28px] bg-gradient-to-r from-[#070e24] via-[#0d1c42] to-[#12193b] p-8 sm:p-10 lg:p-12 text-white overflow-hidden border border-white/10 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
      {/* Subtle Ambient Glowing Wave / Ribbon in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-[800px] h-[300px]"
          viewBox="0 0 800 300"
          fill="none"
        >
          <path
            d="M-50 150 Q 150 280, 350 120 T 750 150"
            stroke="url(#blueWaveGlow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="blueWaveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════
          LEFT SIDE: TEXT AND CTA
      ══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-md">
        <span className="text-xs font-black tracking-widest text-sky-400 uppercase">
          LIVE MARKETPLACE
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
          Open Campaigns
        </h2>
        <p className="text-sm text-neutral-300 mt-2.5 font-medium leading-relaxed">
          Apply, edit, post, and earn from real verified views.
        </p>

        <div className="mt-6">
          <Link
            href="/?auth=editor-create"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 hover:border-white text-white bg-white/5 hover:bg-white/15 px-6 py-3 text-xs font-black transition-all shadow-md active:scale-98"
          >
            <span>Browse all campaigns</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT SIDE: 4 OVERLAPPING ANGLED CARD THUMBNAILS
      ══════════════════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-center lg:justify-end pr-2 overflow-visible pt-4 lg:pt-0">
        <div className="flex items-center">
          {/* Card 1: Podcaster */}
          <div className="w-28 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transform -rotate-6 hover:-rotate-3 transition duration-300 bg-neutral-900 shrink-0">
            <img
              src="/campaign_thumb_1.jpg"
              alt="Podcast Campaign"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 2: Creator Woman */}
          <div className="w-28 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transform -rotate-2 -ml-8 sm:-ml-10 z-10 hover:rotate-0 transition duration-300 bg-neutral-900 shrink-0">
            <img
              src="/campaign_thumb_2.jpg"
              alt="Creator Portrait Campaign"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 3: Architecture */}
          <div className="w-28 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transform rotate-3 -ml-8 sm:-ml-10 z-20 hover:rotate-1 transition duration-300 bg-neutral-900 shrink-0">
            <img
              src="/campaign_thumb_3.jpg"
              alt="Travel & Culture Campaign"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 4: Food Bowl */}
          <div className="w-28 sm:w-36 lg:w-40 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transform rotate-6 -ml-8 sm:-ml-10 z-30 hover:rotate-4 transition duration-300 bg-neutral-900 shrink-0">
            <img
              src="/campaign_thumb_4.jpg"
              alt="Food & Lifestyle Campaign"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
