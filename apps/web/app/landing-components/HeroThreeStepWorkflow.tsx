"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Play,
  Scissors,
  ShieldCheck,
  TrendingUp,
  Volume2,
} from "lucide-react";

export function HeroThreeStepWorkflow() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(2);

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl">
      {/* 3 Connected Pipeline Cards Container */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:gap-6 items-stretch">

        {/* ══════════════════════════════════════════════════════
            CARD 01: LONG FOOTAGE
        ══════════════════════════════════════════════════════ */}
        <div
          onClick={() => setActiveStep(1)}
          className={`glass-card glass-card-hover group relative flex cursor-pointer flex-col justify-between rounded-3xl p-5 md:p-6 transition-all border border-[#e5e7eb] dark:border-white/10 ${
            activeStep === 1
              ? "ring-2 ring-[#01173b] dark:ring-white shadow-2xl bg-white/95 dark:bg-[#071329]/95"
              : "hover:border-[#01173b]/40 dark:hover:border-white/20"
          }`}
        >
          {/* Step Pill */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#01173b] text-[11px] font-black text-white dark:bg-white dark:text-[#01173b]">
                01
              </span>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">Long Footage</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#e5e7eb]">Raw Input</span>
          </div>

          {/* 16:9 Video Mockup */}
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-inner border border-black/10 dark:border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80"
              alt="16:9 Podcast raw video footage"
              fill
              className="object-cover opacity-80 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Timecode Badge */}
            <div className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-sm border border-white/10">
              16:9 • 10:19 min
            </div>

            {/* Play Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#01173b]/80 hover:bg-[#01173b] text-white border border-white/30 backdrop-blur-md transition hover:scale-110 shadow-lg"
            >
              <Play size={16} className="fill-current text-white translate-x-0.5" />
            </button>
          </div>

          {/* Animated Waveform */}
          <div className="mt-4 rounded-xl bg-[#e5e7eb]/40 p-3 dark:bg-black/40 border border-[#e5e7eb] dark:border-white/5">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-[#e5e7eb]">
              <span className="flex items-center gap-1 text-[#01173b] dark:text-white font-extrabold">
                <Volume2 size={13} className="text-[#01173b] dark:text-sky-300" /> Podcast Audio
              </span>
              <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">48 kHz • Stereo</span>
            </div>
            <div className="mt-2 flex h-6 items-end justify-between gap-0.5">
              {[40, 75, 55, 90, 30, 80, 100, 65, 45, 85, 95, 30, 60, 85, 40, 70, 95, 50, 80, 60].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: `${h}%`,
                    animationDelay: `${((i * 0.08) % 1.1).toFixed(2)}s`,
                    animationPlayState: isPlaying ? "running" : "paused",
                  }}
                  className="w-1 rounded-full bg-[#01173b] dark:bg-white animate-audio-wave origin-bottom"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 02: EDITORS CUT SHORTS
        ══════════════════════════════════════════════════════ */}
        <div
          onClick={() => setActiveStep(2)}
          className={`glass-card glass-card-hover group relative flex cursor-pointer flex-col justify-between rounded-3xl p-5 md:p-6 transition-all border border-[#e5e7eb] dark:border-white/10 ${
            activeStep === 2
              ? "ring-2 ring-[#01173b] dark:ring-white shadow-2xl bg-white/95 dark:bg-[#071329]/95"
              : "hover:border-[#01173b]/40 dark:hover:border-white/20"
          }`}
        >
          {/* Step Pill */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#01173b] text-[11px] font-black text-white dark:bg-white dark:text-[#01173b]">
                02
              </span>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">Editors Cut Shorts</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#01173b] dark:text-[#e5e7eb]">
              <Scissors size={11} className="text-[#01173b] dark:text-sky-300" /> 9:16 Vertical
            </span>
          </div>

          {/* 9:16 Vertical Reel Preview */}
          <div className="relative mx-auto mt-4 aspect-[9/16] w-36 overflow-hidden rounded-2xl bg-neutral-950 shadow-xl ring-1 ring-black/10 dark:ring-white/15">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
              alt="9:16 Vertical reel edit with kinetic subtitles"
              fill
              className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Kinetic Caption Overlay */}
            <div className="absolute inset-x-2 bottom-6 text-center">
              <span className="inline-block rounded-md bg-gradient-to-r from-[#01173b] to-black px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-lg border border-[#e5e7eb]/30">
                VIRAL HOOK 💥
              </span>
              <p className="mt-1 text-[10px] font-bold text-white drop-shadow">
                Kinetic dynamic captions synced to voice
              </p>
            </div>

            {/* Scissors Animation Indicator */}
            <div className="absolute right-2 top-2 rounded-full bg-[#01173b]/80 border border-white/20 p-1.5 text-white backdrop-blur-md">
              <Scissors size={12} className="animate-pulse" />
            </div>
          </div>

          {/* Subtext */}
          <div className="mt-4 rounded-xl bg-[#e5e7eb]/40 border border-[#e5e7eb] p-2.5 text-center dark:bg-white/5 dark:border-white/10">
            <p className="text-xs font-bold text-[#01173b] dark:text-[#e5e7eb]">
              Top editors trim & sync dynamic audio
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 03: PAY FOR VIEWS & EARN
        ══════════════════════════════════════════════════════ */}
        <div
          onClick={() => setActiveStep(3)}
          className={`glass-card glass-card-hover group relative flex cursor-pointer flex-col justify-between rounded-3xl p-5 md:p-6 transition-all border border-[#e5e7eb] dark:border-white/10 ${
            activeStep === 3
              ? "ring-2 ring-[#01173b] dark:ring-white shadow-2xl bg-white/95 dark:bg-[#071329]/95"
              : "hover:border-[#01173b]/40 dark:hover:border-white/20"
          }`}
        >
          {/* Step Pill */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#01173b] text-[11px] font-black text-white dark:bg-white dark:text-[#01173b]">
                03
              </span>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">Pay for Views & Earn</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#01173b] dark:text-[#e5e7eb]">
              <ShieldCheck size={12} className="text-[#01173b] dark:text-sky-300" /> Escrow Protected
            </span>
          </div>

          {/* Real-time Views Metric Block */}
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white/90 p-4 dark:border-white/10 dark:bg-black/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#e5e7eb]">
                Real-Time Verified Views
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-neutral-900 dark:text-white">+150K</span>
                <span className="flex items-center gap-1 text-xs font-black text-[#01173b] dark:text-sky-300">
                  <TrendingUp size={13} /> Trending
                </span>
              </div>
            </div>

            {/* Escrow Payout Pill */}
            <div className="rounded-2xl border border-[#e5e7eb] bg-gradient-to-br from-[#01173b]/5 via-[#e5e7eb]/40 to-white p-4 transition dark:border-white/10 dark:from-[#01173b]/30 dark:via-black/40 dark:to-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#01173b] dark:text-[#e5e7eb]">
                    <CheckCircle2 size={13} className="text-[#01173b] dark:text-sky-300" /> Escrow Payout Credited
                  </span>
                  <p className="mt-1 text-2xl font-black text-[#01173b] dark:text-white">
                    ₹18,500
                  </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#01173b] text-white shadow-md dark:bg-white dark:text-[#01173b]">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-neutral-600 dark:text-[#e5e7eb]/80">
                85% paid directly to editor wallet • 15% platform cut
              </p>
            </div>
          </div>

          {/* Trust Guarantee */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-600 dark:text-[#e5e7eb]">
            <ShieldCheck size={13} className="text-[#01173b] dark:text-sky-300" /> 100% No Views = No Cost Guarantee
          </div>
        </div>

      </div>
    </div>
  );
}
