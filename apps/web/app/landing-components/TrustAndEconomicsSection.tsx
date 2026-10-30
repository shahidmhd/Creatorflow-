"use client";

import { ShieldCheck, IndianRupee, Eye, CheckCircle2, Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function TrustAndEconomicsSection() {
  return (
    <section className="relative py-24 md:py-32 border-b border-neutral-200/60 dark:border-white/5 overflow-hidden">
      <div className="container max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Description & Trust Principles */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-3.5 py-1 text-xs font-black tracking-wide text-neutral-800 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 mb-4">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              TRANSPARENT PLATFORM ECONOMICS
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] text-neutral-900 dark:text-white leading-[1.08]">
              Pay for performance. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Protected by escrow.
              </span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
              We eliminated upfront retainer waste. By holding campaign budgets in protected escrow pools, brands only pay for views that genuinely happen, and editors are guaranteed payment for every verified impression.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  title: "100% Escrow Guarantee",
                  desc: "Funds are locked in escrow prior to campaign start. Zero views equals zero spend for the brand.",
                  icon: Lock,
                },
                {
                  title: "85% Editor Compensation",
                  desc: "Editors keep 85% of gross earnings. 15% platform fee covers view verification and payouts.",
                  icon: IndianRupee,
                },
                {
                  title: "Audited View Verification",
                  desc: "Every view undergoes a multi-day anti-fraud retention hold to guarantee organic human viewership.",
                  icon: Eye,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 rounded-2xl bg-white/80 p-4 border border-neutral-200/70 shadow-xs dark:bg-white/5 dark:border-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Financial Breakdown Card */}
          <div className="relative">
            <div className="rounded-[32px] border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/80 to-blue-50/30 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:from-[#0c1628] dark:via-[#0c1628]/90 dark:to-blue-950/20">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-6 dark:border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Example Campaign Settlement
                  </span>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">
                    100,000 Verified Views
                  </h3>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified
                </div>
              </div>

              {/* Payout Breakdown Metrics */}
              <div className="mt-6 space-y-4">
                {/* Brand View Rate */}
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Campaign Rate (per 1k views)</span>
                  <span className="font-mono font-black text-neutral-900 dark:text-white">₹850.00</span>
                </div>

                {/* Gross Campaign Value */}
                <div className="flex items-center justify-between py-2 text-sm border-t border-neutral-100 dark:border-white/5">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Gross Pool Value</span>
                  <span className="font-mono font-black text-neutral-900 dark:text-white">₹85,000</span>
                </div>

                {/* 85% Editor Payout */}
                <div className="flex items-center justify-between rounded-2xl bg-blue-600/10 p-4 border border-blue-500/20 dark:bg-blue-500/10">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={18} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-black text-neutral-900 dark:text-white">85% Editor Share</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Credited directly to editor wallets</p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹72,250</span>
                </div>

                {/* 15% Platform Maintenance */}
                <div className="flex items-center justify-between py-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>15% Platform Fee (Escrow, AI Verification & API tracking)</span>
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">₹12,750</span>
                </div>
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="mt-6 rounded-xl bg-neutral-100/90 p-4 text-center dark:bg-white/5 border border-neutral-200/60 dark:border-white/5">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-500" /> Zero views recorded = 100% refund to brand wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
