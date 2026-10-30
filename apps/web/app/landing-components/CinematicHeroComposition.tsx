"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Scissors,
  TrendingUp,
  ShieldCheck,
  Volume2,
  Maximize2,
  Subtitles,
  Music,
  Wand2,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

export function CinematicHeroComposition() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeFrame, setActiveFrame] = useState(3);
  const [currentTime, setCurrentTime] = useState("12:34");

  // Subtle ticker to animate waveform and frame scrubber
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveFrame((prev) => (prev >= 7 ? 0 : prev + 1));
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-2 sm:px-4 select-none">
      {/* ─── Ambient Glows Behind Composition ─────────────── */}
      <div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 h-[450px] w-[850px] rounded-full bg-gradient-to-tr from-blue-200/35 via-indigo-200/25 to-purple-200/35 blur-[120px] dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20" />

      {/* ─── DESKTOP CINEMATIC LAYOUT (Large screens >= 1024px) ──────── */}
      <div className="relative hidden lg:block w-full min-h-[820px]">
        {/* SVG Connecting Flow Lines with Animated Flow Particles */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full z-0 overflow-visible"
          viewBox="0 0 1400 820"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGradHero" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowHero" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Path 1: Central Player to Short Clips (Top Left) */}
          <path
            d="M 470 480 C 380 430, 340 320, 310 230"
            stroke="url(#lineGradHero)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
          {/* Path 2: Central Player to Editors (Bottom Left) */}
          <path
            d="M 470 570 C 390 580, 350 560, 310 540"
            stroke="url(#lineGradHero)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
          {/* Path 3: Central Player to Earnings (Top Right) */}
          <path
            d="M 930 480 C 1020 430, 1060 320, 1090 230"
            stroke="url(#lineGradHero)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
          {/* Path 4: Central Player to Video Editor (Bottom Right) */}
          <path
            d="M 930 570 C 1010 580, 1050 570, 1080 550"
            stroke="url(#lineGradHero)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />
          {/* Path 5: Central Player to Social Platforms (Bottom Center) */}
          <path
            d="M 700 710 L 700 748"
            stroke="url(#lineGradHero)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-75"
          />

          {/* Animated Particles flowing along paths */}
          <circle r="3.5" fill="#3b82f6" filter="url(#glowHero)">
            <animateMotion
              path="M 470 480 C 380 430, 340 320, 310 230"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3.5" fill="#6366f1" filter="url(#glowHero)">
            <animateMotion
              path="M 470 570 C 390 580, 350 560, 310 540"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3.5" fill="#8b5cf6" filter="url(#glowHero)">
            <animateMotion
              path="M 930 480 C 1020 430, 1060 320, 1090 230"
              dur="4.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3.5" fill="#2563eb" filter="url(#glowHero)">
            <animateMotion
              path="M 930 570 C 1010 580, 1050 570, 1080 550"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#6366f1" filter="url(#glowHero)">
            <animateMotion path="M 700 710 L 700 748" dur="2.2s" repeatCount="indefinite" />
          </circle>

          {/* Ambient Sparkle Nodes */}
          <g transform="translate(180, 380)" className="animate-pulse">
            <circle r="12" fill="#6366f1" fillOpacity="0.1" />
            <circle r="4" fill="#6366f1" />
          </g>
          <g transform="translate(1220, 260)" className="animate-pulse">
            <circle r="14" fill="#8b5cf6" fillOpacity="0.12" />
            <circle r="4.5" fill="#8b5cf6" />
          </g>
        </svg>

        {/* ══════════════════════════════════════════════════════
            CARD 1: SHORT CLIPS (15s – 60s) — UPPER LEFT
            FLANKS HEADLINE & BUTTONS IN THE BLANK SPACE
        ══════════════════════════════════════════════════════ */}
        <div className="absolute left-1 xl:left-6 2xl:left-10 top-4 xl:top-6 z-10 w-64 xl:w-72 rounded-[24px] border border-neutral-200/90 bg-white/95 p-3.5 xl:p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#0c1628]/95 animate-float-slow">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
              <Scissors size={15} />
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-900 dark:text-white leading-tight">Short Clips</h4>
              <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">15s – 60s</p>
            </div>
          </div>

          {/* 3x2 Grid of 9:16 Vertical Clips */}
          <div className="grid grid-cols-3 gap-1.5 xl:gap-2">
            {[
              { img: "/hero_short_clip_1.jpg", duration: "0:28" },
              { img: "/hero_short_clip_2.jpg", duration: "0:42" },
              { img: "/hero_podcast_main.jpg", duration: "0:36" },
              { img: "/hero_short_clip_2.jpg", duration: "0:45" },
              { img: "/hero_podcast_main.jpg", duration: "0:45" },
              { img: "/hero_short_clip_1.jpg", duration: "0:45" },
            ].map((clip, i) => (
              <div
                key={i}
                className="group/clip relative aspect-[9/16] overflow-hidden rounded-xl bg-neutral-950 border border-neutral-200/60 dark:border-white/10 shadow-xs"
              >
                <img
                  src={clip.img}
                  alt="Short clip extracted moment"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/clip:scale-110 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <span className="absolute bottom-1 right-1 rounded-sm bg-black/75 px-1 py-0.2 text-[9px] font-mono font-bold text-white backdrop-blur-xs">
                  {clip.duration}
                </span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow">
                    <Play size={9} className="fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 2: EDITORS NETWORK — LOWER LEFT
        ══════════════════════════════════════════════════════ */}
        <div className="absolute left-0 xl:left-4 2xl:left-8 top-[365px] xl:top-[385px] z-10 w-64 xl:w-72 rounded-[24px] border border-neutral-200/90 bg-white/95 p-3.5 xl:p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#0c1628]/95 animate-float-reverse">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
              <Users size={15} />
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-900 dark:text-white leading-tight">Editors</h4>
              <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                Skilled creators, ready to work
              </p>
            </div>
          </div>

          {/* Editor Avatars Row */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex -space-x-2.5 overflow-hidden p-0.5">
              {[
                { name: "Arjun K.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
                { name: "Dev P.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
                { name: "Sneha R.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
                { name: "Liam V.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
              ].map((editor, i) => (
                <div
                  key={i}
                  title={editor.name}
                  className="relative h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5 dark:border-[#0c1628]"
                >
                  <img
                    src={editor.img}
                    alt={editor.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-neutral-300 bg-neutral-50 text-neutral-600 text-[11px] font-bold dark:border-white/20 dark:bg-white/5 dark:text-neutral-300">
              +14
            </div>
          </div>

          {/* Badges Footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-white/5 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
              <Sparkles size={11} className="text-indigo-500" /> Creative Editors
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 3: EARNINGS DASHBOARD — UPPER RIGHT
            FLANKS HEADLINE & BUTTONS IN THE BLANK SPACE
        ══════════════════════════════════════════════════ */}
        <div className="absolute right-1 xl:right-6 2xl:right-10 top-4 xl:top-6 z-10 w-68 xl:w-76 rounded-[24px] border border-neutral-200/90 bg-white/95 p-3.5 xl:p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#0c1628]/95 animate-float-slow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm">
                <TrendingUp size={15} />
              </div>
              <h4 className="text-xs font-black text-neutral-900 dark:text-white leading-tight">Earnings</h4>
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              ↑ +12%
            </span>
          </div>

          {/* Large Metric */}
          <div className="mt-1 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">₹18,500</span>
              <p className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500">Sample payout data</p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-blue-400">
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Upward Trending Graph */}
          <div className="mt-1.5 h-12 w-full">
            <svg viewBox="0 0 240 60" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="trendGradHero" x1="0%" y1="0%" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 45 C 40 42, 70 48, 100 32 C 130 18, 170 30, 200 15 L 240 8 L 240 60 L 0 60 Z"
                fill="url(#trendGradHero)"
              />
              <path
                d="M 0 45 C 40 42, 70 48, 100 32 C 130 18, 170 30, 200 15 L 240 8"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="240" cy="8" r="3.5" fill="#6366f1" />
            </svg>
          </div>

          {/* Escrow Protection Mini-Card */}
          <div className="mt-2 rounded-xl border border-neutral-100 bg-neutral-50/80 p-2 dark:border-white/5 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-700 dark:text-neutral-200">
                <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400" /> Escrow Payout Credited
              </span>
              <span className="text-xs font-black text-neutral-900 dark:text-white">₹18,500</span>
            </div>
            <p className="mt-1 text-[9px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight">
              85% paid directly to editor + 15% platform fee
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 4: VIDEO EDITOR / PUBLISHING — LOWER RIGHT
        ══════════════════════════════════════════════════ */}
        <div className="absolute right-0 xl:right-4 2xl:right-8 top-[365px] xl:top-[385px] z-10 w-72 xl:w-80 rounded-[24px] border border-neutral-200/90 bg-white/95 p-3.5 xl:p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#0c1628]/95 animate-float-reverse">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
                <Scissors size={15} />
              </div>
              <div>
                <h4 className="text-xs font-black text-neutral-900 dark:text-white leading-tight">Video Editor</h4>
                <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Trim • Add Captions • Publish
                </p>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-neutral-400" />
          </div>

          {/* Mini Timeline Track */}
          <div className="relative rounded-xl bg-neutral-900 p-2 overflow-hidden border border-neutral-800">
            {/* Video Filmstrip Row */}
            <div className="flex items-center gap-1 h-6">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="relative h-full flex-1 overflow-hidden rounded bg-neutral-800 border border-neutral-700/60"
                >
                  <img
                    src="/hero_podcast_main.jpg"
                    alt="Timeline frame"
                    className="h-full w-full object-cover opacity-70"
                  />
                </div>
              ))}
            </div>

            {/* Audio Waveform Row */}
            <div className="mt-1 flex h-3.5 items-center justify-between gap-0.5 px-0.5">
              {[30, 60, 40, 90, 75, 40, 85, 100, 50, 70, 90, 60, 40, 80, 55, 30].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1 rounded-full bg-cyan-400 dark:bg-cyan-300 opacity-80"
                />
              ))}
            </div>

            {/* Playhead Needle Indicator */}
            <div className="absolute inset-y-0 left-[48%] w-0.5 bg-purple-500 shadow-[0_0_8px_#a855f7]">
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-purple-500 border border-white" />
            </div>
          </div>

          {/* Tool Pills */}
          <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
            {[
              { label: "Trim", icon: Scissors },
              { label: "Captions", icon: Subtitles },
              { label: "Music", icon: Music },
              { label: "Effects", icon: Wand2 },
            ].map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 rounded-xl bg-neutral-50 py-1 text-[10px] font-bold text-neutral-700 transition hover:bg-neutral-100 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 cursor-pointer"
                >
                  <Icon size={11} className="text-neutral-500 dark:text-neutral-400" />
                  <span>{tool.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CENTER COLUMN: HEADER, COPY, BUTTONS & CENTRAL PLAYER
        ══════════════════════════════════════════════════════ */}
        <div className="relative z-20 max-w-2xl xl:max-w-3xl mx-auto text-center pt-2">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-4 py-1.5 text-xs font-black tracking-wide text-neutral-800 mb-4 backdrop-blur-md shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Play size={10} className="fill-current translate-x-0.2" />
            </span>
            <span>Turn Long Videos into Viral Shorts</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-black leading-[1.22] sm:leading-[1.2] lg:leading-[1.18] tracking-[-0.03em] text-neutral-900 dark:text-white max-w-2xl mx-auto">
            Every great moment deserves{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent inline-block">
              a second life
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-3.5 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto font-medium leading-relaxed">
            Got a long video, like a podcast or a talk? Editors on Reviral cut it into short clips and post them online. You set a budget and pay only for the views those clips really get.
          </p>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/?auth=creator-create"
              id="cta-footage"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a1128] hover:bg-[#101b3b] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-7 py-3 text-sm font-black text-white hover:opacity-95 active:scale-[0.98] transition-all shadow-xl"
            >
              Launch Campaign <ArrowRight size={15} />
            </Link>
            <Link
              href="/?auth=editor-create"
              id="cta-edit"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white dark:border-white/10 dark:bg-white/5 px-7 py-3 text-sm font-black text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10 active:scale-[0.98] transition-all backdrop-blur-md shadow-xs"
            >
              Start Editing
            </Link>
          </div>

          {/* Trust Badges Row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-y-1.5 gap-x-6 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-blue-600 dark:text-blue-400" />
              <span>100% Verified Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IndianRupee size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>85% Editor Payouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Escrow Protection</span>
            </div>
          </div>

          {/* ─── CENTRAL VIDEO PLAYER CARD ─────────────────────── */}
          <div className="mt-5 mx-auto w-[510px] xl:w-[570px] rounded-[28px] border border-neutral-200/90 bg-white p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1628] transition-all duration-300">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <Video size={11} />
                </span>
                <span className="text-xs font-black text-neutral-900 dark:text-white">
                  Long Video <span className="font-semibold text-neutral-500 dark:text-neutral-400">(10–24min)</span>
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                {currentTime} / 24:00
              </span>
            </div>

            {/* 16:9 Video Viewport */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-200/50 dark:border-white/10 shadow-inner group">
              <img
                src="/hero_podcast_main.jpg"
                alt="Long-form podcast video stream"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

              {/* Central Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 border border-white/30 backdrop-blur-md"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause size={20} className="fill-current text-white" />
                ) : (
                  <Play size={20} className="fill-current text-white translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Controls & Waveform Bar */}
            <div className="mt-2.5 flex items-center gap-3 px-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition hover:bg-neutral-200 dark:bg-white/10 dark:text-white"
              >
                {isPlaying ? <Pause size={11} /> : <Play size={11} className="translate-x-0.5" />}
              </button>

              {/* Dynamic Animated Waveform */}
              <div className="flex h-4 flex-1 items-center justify-between gap-0.5">
                {[
                  35, 60, 45, 90, 70, 30, 85, 95, 40, 65, 80, 50, 95, 100, 60, 40, 75, 85, 30, 60, 90, 50, 40, 70, 85,
                  45, 65, 90, 75, 35, 55, 40,
                ].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${h}%`,
                      animationDelay: `${((i * 0.05) % 1).toFixed(2)}s`,
                      animationPlayState: isPlaying ? "running" : "paused",
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-blue-600 to-violet-500 animate-audio-wave origin-bottom"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <Volume2 size={13} className="hover:text-neutral-700 dark:hover:text-white cursor-pointer" />
                <Maximize2 size={13} className="hover:text-neutral-700 dark:hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Filmstrip Scrubber Track */}
            <div className="relative mt-2 flex items-center gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-black/40 border border-neutral-200/50 dark:border-white/5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFrame(idx)}
                  className={`relative aspect-[16/10] flex-1 overflow-hidden rounded-lg transition-all ${
                    activeFrame === idx
                      ? "ring-2 ring-indigo-500 scale-105 z-10 shadow-md"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src="/hero_podcast_main.jpg"
                    alt={`Scrubber thumb ${idx}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {/* Active Playhead Cursor Indicator */}
              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-indigo-500 transition-all duration-300"
                style={{ left: `${((activeFrame + 0.5) / 8) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-indigo-600 border border-white" />
              </div>
            </div>
          </div>

          {/* ─── SOCIAL PLATFORMS PILL BAR ────────────────────── */}
          <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-neutral-200/90 bg-white/95 px-5 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0c1628]/95">
            <div
              title="YouTube Shorts"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-xs transition hover:scale-110"
            >
              <Play size={11} className="fill-current translate-x-0.5" />
            </div>

            <div
              title="Instagram Reels"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-xs transition hover:scale-110"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="4" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </div>

            <div
              title="TikTok"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-xs transition hover:scale-110 border border-white/20"
            >
              <span className="text-[10px] font-black">♪</span>
            </div>

            <div
              title="X (Twitter)"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xs transition hover:scale-110 dark:bg-white dark:text-black"
            >
              <span className="text-[9px] font-black">𝕏</span>
            </div>

            <div
              title="LinkedIn Video"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0a66c2] text-white shadow-xs transition hover:scale-110"
            >
              <span className="text-[10px] font-black">in</span>
            </div>

            <div className="h-4 w-px bg-neutral-200 dark:bg-white/10" />

            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
              Publish to all platforms
            </span>
          </div>
        </div>
      </div>

      {/* ─── TABLET & MOBILE RESPONSIVE COMPOSITION (< 1024px) ──────── */}
      <div className="lg:hidden space-y-6 pt-2 text-center">
        {/* Mobile Header Text */}
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-3.5 py-1 text-xs font-black tracking-wide text-neutral-800 mb-2 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px]">
            ▶
          </span>
          <span>Turn Long Videos into Viral Shorts</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black leading-[1.22] tracking-[-0.03em] text-neutral-900 dark:text-white">
          Every great moment deserves{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent inline-block">
            a second life
          </span>
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium max-w-md mx-auto">
          Got a long video, like a podcast or a talk? Editors on Reviral cut it into short clips and post them online. You set a budget and pay only for the views those clips really get.
        </p>

        {/* Mobile Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/?auth=creator-create"
            className="inline-flex items-center gap-2 rounded-full bg-[#0a1128] px-6 py-3 text-xs font-black text-white shadow-lg dark:bg-white dark:text-black"
          >
            Launch Campaign <ArrowRight size={14} />
          </Link>
          <Link
            href="/?auth=editor-create"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-xs font-black text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Start Editing
          </Link>
        </div>

        {/* Mobile Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
          <span>✓ 100% Verified Views</span>
          <span>₹ 85% Editor Payouts</span>
          <span>🛡 Escrow Protection</span>
        </div>

        {/* Mobile Central Player */}
        <div className="rounded-[22px] border border-neutral-200/90 bg-white p-3 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0c1628] text-left">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Video size={13} className="text-blue-600" /> Long Video (10–24min)
            </span>
            <span className="font-mono text-[10px] text-neutral-500">{currentTime} / 24:00</span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950">
            <img
              src="/hero_podcast_main.jpg"
              alt="Podcast still"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white shadow-xl border border-white/30 backdrop-blur-md"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
            </button>
          </div>
        </div>

        {/* 2-Column Mobile Grid for Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Mobile Short Clips Card */}
          <div className="rounded-[20px] border border-neutral-200/90 bg-white p-4 shadow-md dark:border-white/10 dark:bg-[#0c1628]">
            <div className="flex items-center gap-2 mb-3">
              <Scissors size={14} className="text-blue-600" />
              <h4 className="text-xs font-black text-neutral-900 dark:text-white">Short Clips (15s–60s)</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { img: "/hero_short_clip_1.jpg", duration: "0:28" },
                { img: "/hero_short_clip_2.jpg", duration: "0:42" },
                { img: "/hero_podcast_main.jpg", duration: "0:36" },
              ].map((clip, i) => (
                <div key={i} className="relative aspect-[9/16] overflow-hidden rounded-lg bg-neutral-950">
                  <img src={clip.img} alt="Clip" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[8px] font-mono font-bold text-white">
                    {clip.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Earnings Card */}
          <div className="rounded-[20px] border border-neutral-200/90 bg-white p-4 shadow-md dark:border-white/10 dark:bg-[#0c1628]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-600" /> Earnings
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                ↑ +12%
              </span>
            </div>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">₹18,500</p>
            <p className="text-[10px] text-neutral-400 mb-2">Sample payout data</p>
            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-white/5 text-[10px] text-neutral-600 dark:text-neutral-300">
              <ShieldCheck size={12} className="inline mr-1 text-blue-600" /> 85% paid directly to editor
            </div>
          </div>
        </div>

        {/* Mobile Social Bar */}
        <div className="flex items-center justify-center gap-3 rounded-full border border-neutral-200/90 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-[#0c1628]">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Publish to:</span>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-[10px]">▶</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white text-[10px]">📷</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-[10px]">♪</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-[9px] dark:bg-white dark:text-black">𝕏</span>
          </div>
        </div>
      </div>
    </div>
  );
}
