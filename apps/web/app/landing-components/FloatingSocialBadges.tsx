"use client";

import { Play, TrendingUp, ShieldCheck } from "lucide-react";

export function FloatingSocialBadges() {
  return (
    <>
      {/* ─── Left: Floating 3D Instagram Reel Badge ─────────── */}
      <div className="pointer-events-none absolute -left-4 top-1/4 z-10 hidden sm:block md:left-2 lg:left-6 xl:left-12">
        <div className="animate-float-slow flex flex-col items-center gap-2">
          {/* Glass 3D Squircle with Instagram Gradient */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-0.5 shadow-2xl transition-all dark:shadow-[0_0_40px_rgba(238,42,123,0.35)]">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              {/* Instagram Glyph */}
              <svg className="h-8 w-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>
            {/* Luminous border highlight */}
            <span className="absolute inset-0 rounded-2xl ring-1 ring-white/40" />
          </div>

          {/* Metric Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white/90 px-3 py-1 text-[11px] font-black text-neutral-800 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-[#0e1626]/90 dark:text-white">
            <Play size={10} className="fill-current text-pink-500" />
            <span>1.2M Views</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Floating 3D YouTube Shorts Badge ─────────── */}
      <div className="pointer-events-none absolute -right-4 top-1/3 z-10 hidden sm:block md:right-2 lg:right-6 xl:right-12">
        <div className="animate-float-reverse flex flex-col items-center gap-2">
          {/* Glass 3D Squircle with YouTube Red Neon */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#b91c1c] via-[#ef4444] to-[#f87171] p-0.5 shadow-2xl transition-all dark:shadow-[0_0_45px_rgba(239,68,68,0.45)]">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              {/* Shorts Play Glyph */}
              <svg className="h-8 w-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 15l5.19-3L10 9v6z" />
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="absolute inset-0 rounded-2xl ring-1 ring-white/40" />
          </div>

          {/* Metric Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white/90 px-3 py-1 text-[11px] font-black text-neutral-800 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-[#0e1626]/90 dark:text-white">
            <TrendingUp size={11} className="text-emerald-500" />
            <span>+150k views</span>
          </div>
        </div>
      </div>
    </>
  );
}
