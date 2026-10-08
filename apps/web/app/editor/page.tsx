"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle, Clock, Wallet } from "lucide-react";

export default function EditorOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Editor Overview</h1>
          <p className="text-sm text-neutral-500">Apply to campaigns, track submitted content, and view your virtual wallet.</p>
        </div>
        <Link
          href="/editor/campaigns"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-95"
        >
          <BriefcaseBusiness size={16} /> Browse Campaigns
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Applications", val: "2", icon: Clock },
          { label: "Approved Submissions", val: "5", icon: CheckCircle },
          { label: "Pending Payouts", val: "₹1,700", icon: Clock },
          { label: "Virtual Wallet", val: "₹12,450", icon: Wallet },
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

      {/* Recent Submissions */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">Recent Content Submissions</h2>
          <Link href="/editor/submissions" className="text-xs font-bold text-navy hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {[
            { campaign: "Summer Reels Challenge", status: "APPROVED", date: "Yesterday", earning: "₹4,250" },
            { campaign: "Tech Unboxing Series", status: "CHANGES_REQUESTED", date: "3 days ago", earning: "₹6,800" },
            { campaign: "Podcast Snippet Highlight", status: "SUBMITTED", date: "5 days ago", earning: "₹2,125" },
          ].map((item) => (
            <div key={item.campaign} className="flex items-center justify-between py-3.5">
              <div>
                <p className="font-bold text-sm text-neutral-900">{item.campaign}</p>
                <p className="text-xs text-neutral-400">Submitted {item.date} • Potential Earning: {item.earning}</p>
              </div>
              <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
