"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface CampaignItem {
  id: string;
  title: string;
  status: string;
  category: string;
  socialPlatform: string;
  rewardAmount: number;
  deadline: string;
  _count?: {
    applications: number;
    submissions?: number;
  };
}

export default function CreatorCampaignsListPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CampaignItem[]>("/campaigns/mine")
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => {
        // Mock fallback for UI preview
        setCampaigns([
          {
            id: "cmp-1",
            title: "Summer Viral Reels Challenge",
            status: "PUBLISHED",
            category: "Fashion",
            socialPlatform: "Instagram",
            rewardAmount: 500000,
            deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
            _count: { applications: 6 },
          },
          {
            id: "cmp-2",
            title: "Tech Unboxing Short Series",
            status: "DRAFT",
            category: "Tech",
            socialPlatform: "YouTube",
            rewardAmount: 800000,
            deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
            _count: { applications: 0 },
          },
          {
            id: "cmp-3",
            title: "Fitness Workout Clips",
            status: "COMPLETED",
            category: "Fitness",
            socialPlatform: "TikTok",
            rewardAmount: 300000,
            deadline: new Date(Date.now() - 86400000 * 2).toISOString(),
            _count: { applications: 12 },
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => (filter === "ALL" ? true : c.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">My Campaigns</h1>
          <p className="text-sm text-neutral-500">Manage drafts, active campaigns, applications, and approvals.</p>
        </div>
        <Link
          href="/creator/campaigns/new"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-95"
        >
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-navy/10 pb-3">
        {["ALL", "DRAFT", "PUBLISHED", "PAUSED", "COMPLETED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === st ? "bg-navy text-white shadow-sm" : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-neutral-400">Loading campaigns...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center text-neutral-500">
          No campaigns found for the selected filter.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
          {filtered.map((c) => {
            const gross = Math.round(c.rewardAmount / 100);
            return (
              <div key={c.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Link href={`/creator/campaigns/${c.id}`} className="font-black text-base text-neutral-900 hover:text-navy hover:underline">
                      {c.title}
                    </Link>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-neutral-400">
                    {c.socialPlatform} • {c.category} • Due {new Date(c.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 font-bold uppercase">Reward</p>
                    <p className="text-base font-black text-navy">₹{gross.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 font-bold uppercase">Applications</p>
                    <p className="text-base font-black text-neutral-700">{c._count?.applications ?? 0}</p>
                  </div>
                  <Link
                    href={`/creator/campaigns/${c.id}`}
                    className="rounded-full border border-navy/20 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-navy-soft"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
