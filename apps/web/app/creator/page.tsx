"use client";

import Link from "next/link";
import { ArrowRight, Plus, Sparkles, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function CreatorOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Creator Overview</h1>
          <p className="text-sm text-neutral-500">Monitor active campaigns, submissions, and reward release statuses.</p>
        </div>
        <Link
          href="/creator/campaigns/new"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-95"
        >
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Campaigns", val: "3", icon: TrendingUp },
          { label: "Pending Applications", val: "7", icon: Users },
          { label: "Submissions to Review", val: "4", icon: Sparkles },
          { label: "Rewards Credited", val: "₹18,500", icon: CheckCircle2 },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
              <Icon size={18} className="text-navy" />
            </div>
            <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-navy">{val}</p>
          </div>
        ))}
      </div>

      {/* Recent Campaign Activity */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">Recent Campaigns</h2>
          <Link href="/creator/campaigns" className="text-xs font-bold text-navy hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {[
            { title: "Summer Reels Challenge", platform: "Instagram", reward: "₹5,000", status: "PUBLISHED" },
            { title: "Tech Unboxing Short Series", platform: "YouTube", reward: "₹8,000", status: "PUBLISHED" },
            { title: "Gaming Clip Compilation", platform: "TikTok", reward: "₹3,500", status: "DRAFT" },
          ].map((c) => (
            <div key={c.title} className="flex items-center justify-between py-3.5">
              <div>
                <p className="font-bold text-sm text-neutral-900">{c.title}</p>
                <p className="text-xs text-neutral-400">{c.platform} • Reward: {c.reward}</p>
              </div>
              <span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
