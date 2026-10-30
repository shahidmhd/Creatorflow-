"use client";

import { Play, Mic, X, Check, TrendingUp, CheckCircle2, ShieldCheck } from "lucide-react";

export function WorkflowStepCards() {
  // 24 equalizer bar heights
  const waveformHeights = [
    30, 45, 75, 55, 90, 60, 40, 80, 100, 70, 45, 60, 85, 95, 65, 40, 70, 85, 50, 35, 65, 80, 50, 30
  ];

  return (
    <section className="py-10 lg:py-16 bg-[#f8f9fb] dark:bg-[#070b14] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ══════════════════════════════════════════════════
              CARD 01: LONG FOOTAGE (RAW INPUT - PODCAST LONG VIDEO)
          ══════════════════════════════════════════════════ */}
          <div className="rounded-[28px] border border-neutral-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-[#0c182b] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-black text-xs dark:bg-blue-900/40 dark:text-blue-300">
                    01
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                    Long Footage
                  </h3>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  RAW INPUT
                </span>
              </div>

              {/* Video Player Box: Real Long-Form Podcast Video */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-inner group">
                <img
                  src="/step1_podcast_long.jpg"
                  alt="Podcast long-form video interview"
                  className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white text-neutral-900 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={18} className="fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Audio Meta */}
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Mic size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Podcast Long Video</span>
                </div>
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">48 kHz • Stereo</span>
              </div>

              {/* Waveform Equalizer */}
              <div className="mt-3 flex items-end justify-between h-8 gap-[3px] px-1">
                {waveformHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-full bg-cyan-500 dark:bg-cyan-400 transition-all duration-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD 02: EDITORS CUT SHORTS (EDITING CLIPS TO REELS)
          ══════════════════════════════════════════════════ */}
          <div className="rounded-[28px] border border-neutral-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-[#0c182b] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-black text-xs dark:bg-purple-900/40 dark:text-purple-300">
                    02
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                    Editors Cut Shorts
                  </h3>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  9:16 VERTICAL
                </span>
              </div>

              {/* Vertical Short Frame: Editor actively cutting clip into reel */}
              <div className="relative w-44 mx-auto aspect-[9/13.5] rounded-2xl overflow-hidden shadow-lg border border-purple-200/50 dark:border-purple-900/30 bg-neutral-950">
                <img
                  src="/step2_editor_cutting.jpg"
                  alt="Editor cutting clips to short reels"
                  className="h-full w-full object-cover"
                />

                {/* Close Button Top Right */}
                <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-black/60 text-white/80 flex items-center justify-center">
                  <X size={12} />
                </div>

                {/* Viral Hook Badge & Dynamic Captions */}
                <div className="absolute bottom-2.5 inset-x-2.5 space-y-1.5 text-center">
                  <span className="inline-block rounded-full bg-[#facc15] px-2.5 py-0.5 text-[10px] font-black text-black tracking-wide shadow-sm">
                    VIRAL HOOK 🔥
                  </span>
                  <div className="rounded-xl bg-black/75 backdrop-blur-md px-2 py-1 border border-white/10">
                    <p className="text-[10px] font-bold text-white leading-tight">
                      Kinetic dynamic captions synced to voice
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sub-Pill */}
            <div className="mt-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/20 py-2.5 px-3 text-center">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Top editors trim & sync dynamic audio
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              CARD 03: PAY FOR VIEWS & EARN (PAYOUT IMAGE + ESCROW)
          ══════════════════════════════════════════════════ */}
          <div className="rounded-[28px] border border-neutral-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-white/10 dark:bg-[#0c182b] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs dark:bg-emerald-900/40 dark:text-emerald-300">
                    03
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                    Pay for Views &amp; Earn
                  </h3>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ESCROW PROTECTED
                </span>
              </div>

              {/* Payout Screen Image Visual */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-inner group mb-3">
                <img
                  src="/step3_payout_escrow.jpg"
                  alt="Verified escrow payout"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-sm border border-white/15">
                  <CheckCircle2 size={12} className="text-white" />
                  <span>Payout Credited</span>
                </div>
              </div>

              {/* Escrow Payout Credited Box */}
              <div className="rounded-2xl bg-[#eaf8f0] dark:bg-emerald-950/20 border border-[#c2eed4] dark:border-emerald-800/40 p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Verified Escrow
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={12} />
                    +150K Views
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹18,500
                  </span>
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Check size={16} strokeWidth={3} />
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-emerald-800/80 dark:text-emerald-300/80">
                  85% paid directly to editor wallet • 15% platform cut
                </p>
              </div>
            </div>

            {/* Bottom Guarantee */}
            <div className="mt-4 text-center">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>100% No Views = No Cost Guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
