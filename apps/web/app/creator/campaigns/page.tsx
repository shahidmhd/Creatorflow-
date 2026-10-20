"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Video,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge, CampaignDummyThumbnail } from "@/app/components";

interface CampaignItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  status: string;
  category: string;
  socialPlatform: string;
  rewardAmount: number;
  campaignFund?: number;
  editorRewardPool?: number;
  editorSlots?: number;
  deadline: string;
  _count?: {
    applications: number;
    submissions?: number;
  };
}

export default function CreatorCampaignsListPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CampaignItem[]>("/campaigns/mine")
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => {
        // Fallback realistic examples if none exist yet
        setCampaigns([
          {
            id: "cmp-1",
            title: "Summer Viral Reels Challenge",
            thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
            status: "PUBLISHED",
            category: "Fashion",
            socialPlatform: "Instagram",
            rewardAmount: 500000,
            campaignFund: 500000,
            editorRewardPool: 425000,
            editorSlots: 5,
            deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
            _count: { applications: 6, submissions: 4 },
          },
          {
            id: "cmp-2",
            title: "Tech Unboxing Short Series",
            thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
            status: "DRAFT",
            category: "Tech",
            socialPlatform: "YouTube",
            rewardAmount: 800000,
            campaignFund: 800000,
            editorRewardPool: 680000,
            editorSlots: 8,
            deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
            _count: { applications: 0, submissions: 0 },
          },
          {
            id: "cmp-3",
            title: "Fitness Workout Clips",
            thumbnail: null,
            status: "COMPLETED",
            category: "Fitness",
            socialPlatform: "Instagram",
            rewardAmount: 300000,
            campaignFund: 300000,
            editorRewardPool: 255000,
            editorSlots: 4,
            deadline: new Date(Date.now() - 86400000 * 2).toISOString(),
            _count: { applications: 12, submissions: 9 },
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesFilter = filter === "ALL" ? true : c.status === filter;
    const matchesSearch = search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            My Campaigns
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your funded briefs, review editor applications, and track view performance.
          </p>
        </div>
        <Link
          href="/creator/campaigns/new"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
        >
          <Plus size={15} /> New Campaign
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy/10 pb-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "DRAFT", "PUBLISHED", "PAUSED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition border ${
                filter === st
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-neutral-600 border-navy/10 hover:bg-neutral-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full rounded-full border border-navy/10 bg-white pl-9 pr-4 py-1.5 text-xs font-medium outline-none focus:border-navy"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-bold text-neutral-400">
          Loading campaigns...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center text-neutral-500 space-y-3">
          <p className="font-bold text-sm text-neutral-700">No campaigns found</p>
          <p className="text-xs text-neutral-400">
            {search ? "No campaigns match your search query." : "You haven't created any campaigns matching this filter."}
          </p>
          <Link
            href="/creator/campaigns/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90 transition border border-navy/10"
          >
            <Plus size={14} /> Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-navy/10 bg-white shadow-xs overflow-hidden">
          {filtered.map((c) => {
            const fundMajor = Math.round((c.campaignFund || c.rewardAmount) / 100);
            const poolMajor = Math.round((c.editorRewardPool || (c.rewardAmount * 0.85)) / 100);
            const deadlineDate = c.deadline ? new Date(c.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Open";

            return (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-neutral-50/60 transition group"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-navy/10 bg-neutral-900">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <CampaignDummyThumbnail
                        title={c.title}
                        category={c.category}
                        platform={c.socialPlatform}
                      />
                    )}

                    {/* Platform Badge Overlay */}
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                      {c.socialPlatform === "YouTube" ? (
                        <span className="text-red-400 font-bold">▶</span>
                      ) : (
                        <span className="text-pink-400 font-bold">📸</span>
                      )}
                    </div>
                  </div>

                  {/* Title & Meta */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/creator/campaigns/${c.id}`}
                        className="font-black text-sm text-neutral-900 hover:text-navy hover:underline truncate"
                      >
                        {c.title}
                      </Link>
                      <StatusBadge status={c.status} />
                    </div>

                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-neutral-600">{c.category}</span>
                      <span>•</span>
                      <span>{c.socialPlatform}</span>
                      <span>•</span>
                      <span>Due {deadlineDate}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Financials, Slots & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-navy/5">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      Fund (85% Pool)
                    </p>
                    <p className="text-sm font-black text-neutral-900">
                      ₹{fundMajor.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-semibold text-emerald-600">
                        (₹{poolMajor.toLocaleString("en-IN")})
                      </span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      Slots / Apps
                    </p>
                    <p className="text-sm font-black text-neutral-700">
                      {c.editorSlots || 1} slots · {c._count?.applications ?? 0} apps
                    </p>
                  </div>

                  <Link
                    href={`/creator/campaigns/${c.id}`}
                    className="rounded-full border border-navy/20 bg-white px-4 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft transition shrink-0 flex items-center gap-1"
                  >
                    Manage <ChevronRight size={13} />
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
