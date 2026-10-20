"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Pause,
  Play,
  Trash2,
  RefreshCw,
  Instagram,
  Youtube,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface CampaignItem {
  id: string;
  title: string;
  thumbnail: string | null;
  status: string;
  category: string;
  socialPlatform: string;
  rewardAmount: number;
  campaignFund?: number;
  editorRewardPool?: number;
  editorRewardPoolRemaining?: number;
  campaignFundRemaining?: number;
  totalPaidNet?: number;
  totalDisbursedGross?: number;
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
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CampaignItem[]>("/campaigns/mine");
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleQuickPause = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busyId) return;
    setBusyId(id);
    try {
      await api(`/campaigns/${id}/pause`, { method: "POST" });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "PAUSED" } : c))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to pause campaign");
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickPublish = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busyId) return;
    setBusyId(id);
    try {
      await api(`/campaigns/${id}/publish`, { method: "POST" });
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "PUBLISHED" } : c))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to publish campaign");
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busyId) return;
    if (!confirm("Are you sure you want to permanently delete this campaign?")) return;
    setBusyId(id);
    try {
      await api(`/campaigns/${id}`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete campaign");
    } finally {
      setBusyId(null);
    }
  };

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
            Manage your funded briefs, edit details, pause or resume campaigns, and track editor submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="icon-button"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-navy" : "text-navy"} />
          </button>
          <Link
            href="/creator/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
          >
            <Plus size={15} /> New Campaign
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy/10 pb-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "PUBLISHED", "PAUSED", "DRAFT", "COMPLETED", "CANCELLED"].map((st) => (
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
          Loading campaigns…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy-soft text-navy mb-3">
            <TrendingUp size={22} />
          </div>
          <h3 className="text-base font-black text-neutral-900">
            {search || filter !== "ALL" ? "No matching campaigns" : "No campaigns found"}
          </h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            {search || filter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Launch your first performance campaign to start receiving viral short-form clips."}
          </p>
          {!search && filter === "ALL" && (
            <Link
              href="/creator/campaigns/new"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy/90 transition"
            >
              <Plus size={14} /> Create Campaign
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const fundMajor = Math.round((c.campaignFund ?? c.rewardAmount) / 100);
            const poolMajor = Math.round((c.editorRewardPool ?? Math.floor(fundMajor * 85 * 100)) / 100);
            const poolRemainingMajor =
              c.editorRewardPoolRemaining !== undefined
                ? Math.round(c.editorRewardPoolRemaining / 100)
                : poolMajor;
            const deadlineDate = new Date(c.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const isPublished = c.status === "PUBLISHED";
            const isPaused = c.status === "PAUSED";
            const isDraft = c.status === "DRAFT";
            const isCancelled = c.status === "CANCELLED";

            return (
              <div
                key={c.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm hover:border-navy/30 transition hover:shadow-md"
              >
                {/* Left: 16:9 Thumbnail + Campaign Info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* 16:9 Video Thumbnail Aspect Container */}
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-navy/10">
                    {c.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <ThumbnailFallback
                        title={c.title}
                        category={c.category}
                        platform={c.socialPlatform}
                      />
                    )}

                    {/* Platform Badge Overlay */}
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                      {c.socialPlatform === "YouTube" ? (
                        <Youtube size={10} className="text-red-500 fill-red-500" />
                      ) : (
                        <Instagram size={10} className="text-pink-400" />
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

                {/* Right: Financials, Slots & Quick CRUD Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-navy/5 flex-wrap">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      Editor Pool (Remaining)
                    </p>
                    <p className="text-sm font-black text-neutral-900">
                      ₹{poolRemainingMajor.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-neutral-500">
                        / ₹{poolMajor.toLocaleString("en-IN")}
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

                  {/* Action Group */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Pause button */}
                    {isPublished && (
                      <button
                        onClick={(e) => handleQuickPause(c.id, e)}
                        disabled={busyId === c.id}
                        className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition inline-flex items-center gap-1"
                        title="Pause campaign"
                      >
                        <Pause size={12} /> Pause
                      </button>
                    )}

                    {/* Quick Resume button */}
                    {isPaused && (
                      <button
                        onClick={(e) => handleQuickPublish(c.id, e)}
                        disabled={busyId === c.id}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition inline-flex items-center gap-1"
                        title="Resume campaign"
                      >
                        <Play size={12} /> Resume
                      </button>
                    )}

                    {/* Quick Publish for DRAFT */}
                    {isDraft && (
                      <button
                        onClick={(e) => handleQuickPublish(c.id, e)}
                        disabled={busyId === c.id}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition inline-flex items-center gap-1"
                        title="Publish campaign"
                      >
                        <Play size={12} /> Publish
                      </button>
                    )}

                    {/* Quick Delete for DRAFT or CANCELLED */}
                    {(isDraft || isCancelled) && (
                      <button
                        onClick={(e) => handleQuickDelete(c.id, e)}
                        disabled={busyId === c.id}
                        className="rounded-full border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition"
                        title="Delete campaign"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <Link
                      href={`/creator/campaigns/${c.id}`}
                      className="rounded-full border border-navy/20 bg-white px-4 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft transition flex items-center gap-1"
                    >
                      Manage <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ThumbnailFallback({
  title,
  category,
  platform,
}: {
  title: string;
  category: string;
  platform: string;
}) {
  const gradients: Record<string, string> = {
    Fashion: "from-purple-900 to-indigo-950",
    Beauty: "from-pink-900 to-rose-950",
    Tech: "from-blue-900 to-cyan-950",
    Gaming: "from-emerald-900 to-teal-950",
    Fitness: "from-amber-900 to-orange-950",
  };
  const gradient = gradients[category] || "from-neutral-900 to-navy";

  return (
    <div
      className={`h-full w-full bg-gradient-to-br ${gradient} p-2 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between text-[8px] text-white/70 font-bold uppercase tracking-wider">
        <span>{category}</span>
        <ImageIcon size={10} className="text-white/40" />
      </div>
      <p className="text-[10px] font-black text-white line-clamp-1 leading-tight">
        {title}
      </p>
    </div>
  );
}
