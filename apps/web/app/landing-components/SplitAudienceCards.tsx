"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SplitAudienceCards() {
  return (
    <section className="py-6 lg:py-10 bg-transparent transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ══════════════════════════════════════════════════
              LEFT CARD: FOR BRANDS & CREATORS
          ══════════════════════════════════════════════════ */}
          <div
            id="for-brands"
            className="rounded-[28px] bg-gradient-to-br from-[#0c1a3e] via-[#091533] to-[#07112a] p-8 sm:p-10 text-white relative overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between min-h-[380px]"
          >
            {/* Ambient Radial Glow */}
            <div className="absolute right-0 top-0 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* Content Top */}
            <div className="relative z-10 max-w-md">
              <span className="text-xs font-black tracking-widest text-sky-400 uppercase">
                FOR BRANDS & CREATORS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3 leading-snug">
                Pay only for views that actually happen.
              </h3>
              <p className="text-sm leading-relaxed text-neutral-300 mt-3 font-medium">
                Put your long-form videos in front of hundreds of talented editors. If a clip gets no views, it costs you nothing.
              </p>
            </div>

            {/* Button */}
            <div className="relative z-10 mt-8">
              <Link
                href="/?auth=creator-create"
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-100 text-[#0c1a3e] px-7 py-3.5 text-xs font-black shadow-lg transition-transform active:scale-[0.98]"
              >
                <span>Start a campaign</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Glowing Chart Visual in Bottom Right */}
            <div className="absolute right-2 bottom-0 w-64 h-48 pointer-events-none opacity-85 overflow-visible">
              <svg className="w-full h-full" viewBox="0 0 260 160" fill="none">
                {/* Gradient area under curve */}
                <path
                  d="M10 140 L 60 120 L 110 130 L 160 85 L 210 50 L 250 25 L 250 160 L 10 160 Z"
                  fill="url(#chartAreaGlow)"
                  opacity="0.3"
                />
                {/* Main line */}
                <path
                  d="M10 140 L 60 120 L 110 130 L 160 85 L 210 50 L 250 25"
                  stroke="url(#chartLineGlow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Glowing Nodes / Circles */}
                <circle cx="10" cy="140" r="4" fill="#38bdf8" />
                <circle cx="60" cy="120" r="4" fill="#38bdf8" />
                <circle cx="110" cy="130" r="4" fill="#38bdf8" />
                <circle cx="160" cy="85" r="5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="210" cy="50" r="5" fill="#ffffff" stroke="#818cf8" strokeWidth="2" />
                <circle cx="250" cy="25" r="6" fill="#ffffff" stroke="#60a5fa" strokeWidth="2.5" />

                <defs>
                  <linearGradient id="chartLineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="70%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="chartAreaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT CARD: FOR EDITORS & CLIPPERS
          ══════════════════════════════════════════════════ */}
          <div
            id="for-creators"
            className="rounded-[28px] bg-[#f4f2fb] dark:bg-[#0f1429] p-8 sm:p-10 relative overflow-hidden border border-purple-200/60 dark:border-purple-900/30 shadow-xl flex flex-col justify-between min-h-[380px]"
          >
            {/* Top Burst Hand-Drawn Doodle */}
            <div className="absolute top-5 right-6 z-20 pointer-events-none text-neutral-800 dark:text-neutral-200">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12L2 7" />
                <path d="M14 8L14 2" />
                <path d="M23 12L26 7" />
              </svg>
            </div>

            {/* Content Top */}
            <div className="relative z-10 max-w-sm">
              <span className="text-xs font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                FOR EDITORS & CLIPPERS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white mt-3 leading-snug">
                Turn your editing skill into steady income.
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 mt-3 font-medium">
                Pick a campaign in your favorite niche, cut, post, and watch verified earnings deposit straight into your wallet.
              </p>
            </div>

            {/* Bottom Row with Button & Laptop Editor */}
            <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <Link
                href="/?auth=editor-create"
                className="inline-flex items-center gap-2 rounded-full bg-[#0c142b] hover:bg-[#142045] text-white dark:bg-white dark:text-[#0c142b] px-7 py-3.5 text-xs font-black shadow-lg transition-transform active:scale-[0.98] w-fit"
              >
                <span>Start earning</span>
                <ArrowRight size={14} />
              </Link>

              {/* Editor Working Photo with Lavender Circular Backdrop */}
              <div className="relative w-40 sm:w-48 aspect-square rounded-2xl overflow-hidden shadow-lg border border-purple-200/50 dark:border-purple-900/30 bg-neutral-900 self-end">
                <img
                  src="/editor_laptop.jpg"
                  alt="Editor working on laptop"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
