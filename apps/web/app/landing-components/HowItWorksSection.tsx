"use client";

import { Video, Scissors, ShieldCheck, IndianRupee, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Upload a long video",
    subtitle: "Set budget & terms",
    description:
      "A brand sets a total campaign budget, defines the view rate (e.g. ₹850 per 1,000 views), and uploads source footage or podcast stream links.",
    icon: Video,
    gradient: "from-blue-600 to-indigo-600",
    badge: "Campaign Escrow",
  },
  {
    step: "02",
    title: "Editors cut short clips",
    subtitle: "Creative 9:16 vertical edits",
    description:
      "Vetted editors discover the brief, craft high-retention vertical clips with kinetic typography, hooks, sound design, and submit them.",
    icon: Scissors,
    gradient: "from-indigo-600 to-purple-600",
    badge: "Vetted Editors",
  },
  {
    step: "03",
    title: "Publish & check views",
    subtitle: "AI anti-fraud verification",
    description:
      "Clips go live across TikTok, Instagram Reels, and YouTube Shorts. Views are tracked and audited for multi-day retention to eliminate fake bot traffic.",
    icon: ShieldCheck,
    gradient: "from-purple-600 to-violet-600",
    badge: "100% Real Views",
  },
  {
    step: "04",
    title: "Transparent payouts",
    subtitle: "85% to editors • 15% fee",
    description:
      "Verified views trigger automated escrow releases. Editors receive 85% directly into their bank or UPI wallet. Brands only pay for real impact.",
    icon: IndianRupee,
    gradient: "from-blue-600 to-emerald-600",
    badge: "Instant Wallet Payout",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 border-b border-neutral-200/60 dark:border-white/5 overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/10" />
      <div className="pointer-events-none absolute -right-40 bottom-1/3 h-96 w-96 rounded-full bg-purple-100/40 blur-3xl dark:bg-purple-900/10" />

      <div className="container relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-3.5 py-1 text-xs font-black tracking-wide text-neutral-800 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 mb-4">
            <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
            THE 4-STEP REPURPOSING PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] text-neutral-900 dark:text-white">
            One long video in.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Viral shorts out.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-medium">
            A frictionless, performance-based pipeline engineered so brands gain genuine reach and editors get compensated fairly for real engagement.
          </p>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-[26px] border border-neutral-200/90 bg-white/90 p-7 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/40 dark:border-white/10 dark:bg-[#0c1628]/90"
              >
                <div>
                  {/* Step Pill & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-black tracking-wider text-neutral-400 dark:text-neutral-500">
                      STEP {item.step}
                    </span>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:bg-white/10 dark:text-neutral-300 mb-2">
                    {item.badge}
                  </span>

                  <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 mb-3">
                    {item.subtitle}
                  </p>

                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-neutral-400 dark:text-neutral-500">
                  <span>Phase {index + 1} of 4</span>
                  <ArrowRight size={14} className="text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
