"use client";

import { useState } from "react";
import { CircleDollarSign, Eye, IndianRupee, Sparkles, TrendingUp, Wallet } from "lucide-react";

export function InteractivePayoutCalculator() {
  const [views, setViews] = useState<number>(50000);
  const [ratePer1000, setRatePer1000] = useState<number>(200);

  const grossAmount = Math.floor((views / 1000) * ratePer1000);
  const platformFee = Math.floor(grossAmount * 0.15);
  const editorPayout = grossAmount - platformFee;

  return (
    <div className="glass-card mx-auto max-w-4xl rounded-3xl p-6 sm:p-8 md:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
            <Sparkles size={13} /> Interactive Payout Engine
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
            Transparent Math, Live Simulator
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Drag the sliders to see exactly how views turn into creator reach and editor earnings.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-surface p-1 text-xs font-bold dark:bg-black/40">
          <span className="rounded-xl bg-white px-3 py-1.5 text-neutral-900 shadow-sm dark:bg-[#0e1626] dark:text-white">
            85% Editor Split
          </span>
          <span className="px-3 py-1.5 text-neutral-500">15% Platform Fee</span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Slider 1: Views */}
        <div className="rounded-2xl border border-black/5 bg-surface/50 p-5 dark:border-white/5 dark:bg-black/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Eye size={14} className="text-cyan-500" /> Verified Clip Views
            </span>
            <span className="text-base font-black text-neutral-900 dark:text-white">
              {views.toLocaleString("en-IN")} views
            </span>
          </div>
          <input
            type="range"
            min="5000"
            max="500000"
            step="5000"
            value={views}
            onChange={(e) => setViews(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-cyan-500 dark:bg-neutral-800"
          />
          <div className="mt-2 flex justify-between text-[10px] font-bold text-neutral-400">
            <span>5,000 views</span>
            <span>250,000</span>
            <span>500,000+ views</span>
          </div>
        </div>

        {/* Slider 2: Rate per 1000 views */}
        <div className="rounded-2xl border border-black/5 bg-surface/50 p-5 dark:border-white/5 dark:bg-black/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <IndianRupee size={14} className="text-violet-500" /> Reward Rate (per 1k views)
            </span>
            <span className="text-base font-black text-neutral-900 dark:text-white">
              ₹{ratePer1000.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={ratePer1000}
            onChange={(e) => setRatePer1000(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-violet-500 dark:bg-neutral-800"
          />
          <div className="mt-2 flex justify-between text-[10px] font-bold text-neutral-400">
            <span>₹50 / 1k</span>
            <span>₹500 / 1k</span>
            <span>₹1,000 / 1k</span>
          </div>
        </div>
      </div>

      {/* Real-time Calculation Result Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Pool */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#0e1626]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Gross Escrow Fund
          </span>
          <p className="mt-2 text-2xl font-black text-neutral-900 dark:text-white">
            ₹{grossAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[10px] text-neutral-400">Total brand campaign payout</p>
        </div>

        {/* Platform Cut (15%) */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-[#0e1626]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Reviral Fee (15%)
          </span>
          <p className="mt-2 text-2xl font-black text-neutral-500 dark:text-neutral-400">
            ₹{platformFee.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[10px] text-neutral-400">Verification & platform escrow</p>
        </div>

        {/* Editor Net Takehome (85%) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/15">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Editor Wallet Earnings (85%)
          </span>
          <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{editorPayout.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[10px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
            Directly credited upon view verification
          </p>
        </div>
      </div>
    </div>
  );
}
