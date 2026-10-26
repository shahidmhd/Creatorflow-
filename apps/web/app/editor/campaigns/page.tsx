"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  LayoutGrid,
  Instagram,
  Youtube,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  X,
  Eye,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  Video,
  ExternalLink,
} from "lucide-react";
import { api } from "@/app/api";
import { CampaignCard, CampaignCardData } from "@/app/components";

export default function EditorBrowseCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchCampaigns = () => {
    setLoading(true);
    api<CampaignCardData[]>("/campaigns")
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Dynamically extract categories from available campaigns
  const categories = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [campaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.creator?.name || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q);

      const matchesPlatform =
        selectedPlatform === "ALL" ||
        c.socialPlatform.toLowerCase() === selectedPlatform.toLowerCase();

      const matchesCategory =
        selectedCategory === "ALL" ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesPlatform && matchesCategory;
    });
  }, [campaigns, searchQuery, selectedPlatform, selectedCategory]);

  const featured = campaigns.length > 0 ? campaigns[0] : null;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("ALL");
    setSelectedCategory("ALL");
  };

  return (
    <div className="space-y-7">
      {/* ══════════════════════════════════════════════════
          TOP FEATURED HERO BANNER — High-End SaaS Design
      ══════════════════════════════════════════════════ */}
      {featured ? (
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1528] text-white p-6 sm:p-8 border border-navy/15 shadow-sm">
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3.5 max-w-2xl">
              {/* Micro-Badges Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/90">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Featured Opportunity
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10 text-white/90">
                  {featured.socialPlatform === "YouTube" ? (
                    <>
                      <Youtube size={13} className="text-red-500 fill-red-500" />
                      <span>YouTube</span>
                    </>
                  ) : (
                    <>
                      <Instagram size={13} className="text-pink-400" />
                      <span>Instagram</span>
                    </>
                  )}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10 text-white/70">
                  {featured.category}
                </span>

                {featured.creator && (
                  <span className="inline-flex items-center gap-1 text-white/70 text-xs">
                    <span>by {featured.creator.name}</span>
                    <CheckCircle2 size={13} className="text-sky-400 fill-sky-400/20" />
                  </span>
                )}

                {featured.videoUrl && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/25 px-3 py-1 backdrop-blur-md border border-sky-400/40 text-sky-200">
                    <Video size={13} className="text-sky-300" />
                    <span>Raw Footage Ready</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                  {featured.description || "Produce high-converting vertical edits matching brand brief specifications."}
                </p>
              </div>

              {/* Three Metric Chips */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span className="font-bold text-white">
                    Max Payout: ₹{Math.round((featured.maximumEditorEarning || 0) / 100).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <Eye size={13} className="text-sky-400" />
                  <span className="font-bold text-white">
                    ₹{Math.round((featured.earningPer1000Views || 0) / 100).toLocaleString("en-IN")} / 1k views
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <Users size={13} className="text-amber-400" />
                  <span className="font-bold text-white">
                    {featured.remainingSlots ?? featured.editorSlots} of {featured.editorSlots} slots open
                  </span>
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {featured.videoUrl && (
                <a
                  href={featured.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-md"
                >
                  <Video size={13} /> Raw Footage <ExternalLink size={12} />
                </a>
              )}
              <Link
                href={`/editor/campaigns/${featured.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-black text-navy hover:bg-neutral-100 transition shadow-xs"
              >
                View Brief & Apply <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-navy/10 bg-gradient-to-r from-navy-soft via-white to-navy-soft/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-navy" />
              <h2 className="text-lg font-black text-neutral-900">
                Creator Marketplace Open
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Browse brand briefs, apply for editor slots, and earn 85% payouts on every 1,000 verified views.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MARKETPLACE HEADER & SEARCH TOOLBAR
      ══════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900 flex items-center gap-2">
              <Flame size={20} className="text-navy" />
              Discover Campaigns
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Slot-based brand briefs with automated view tracking and guaranteed 85% payouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="icon-button"
              title="Refresh campaigns"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-navy" : "text-navy"} />
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search by title, brand, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-navy/15 bg-white py-2 pl-9 pr-8 text-xs font-medium outline-none focus:border-navy shadow-xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            FILTER TOOLBAR: PLATFORMS + CATEGORIES
        ══════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white p-3 shadow-xs">
          {/* Platform Filters with Real Lucide Icons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1.5 flex items-center gap-1">
              <SlidersHorizontal size={12} /> Platform:
            </span>

            <button
              onClick={() => setSelectedPlatform("ALL")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                selectedPlatform === "ALL"
                  ? "bg-navy text-white shadow-xs"
                  : "bg-surface text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <LayoutGrid size={13} />
              <span>All</span>
            </button>

            <button
              onClick={() => setSelectedPlatform("Instagram")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                selectedPlatform.toLowerCase() === "instagram"
                  ? "bg-navy text-white shadow-xs"
                  : "bg-surface text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Instagram size={13} className="text-pink-500" />
              <span>Instagram</span>
            </button>

            <button
              onClick={() => setSelectedPlatform("YouTube")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                selectedPlatform.toLowerCase() === "youtube"
                  ? "bg-navy text-white shadow-xs"
                  : "bg-surface text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Youtube size={13} className="text-red-500 fill-red-500" />
              <span>YouTube</span>
            </button>
          </div>

          {/* Category Pills & Count */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.length > 2 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                      selectedCategory === cat
                        ? "bg-navy-soft text-navy font-black border border-navy/20"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {cat === "ALL" ? "All" : cat}
                  </button>
                ))}
              </div>
            )}

            <div className="text-[11px] font-bold text-neutral-400 lg:border-l lg:border-navy/10 lg:pl-3">
              {filtered.length} brief{filtered.length === 1 ? "" : "s"} open
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CAMPAIGN CARDS GRID
      ══════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-xs font-semibold text-neutral-400">Loading marketplace briefs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-soft text-navy mx-auto">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base font-black text-neutral-900">No campaigns found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery || selectedPlatform !== "ALL" || selectedCategory !== "ALL"
              ? "No active briefs match your current filter criteria. Try adjusting or clearing your filters."
              : "No active campaigns currently open. Check back soon for new briefs!"}
          </p>
          {(searchQuery || selectedPlatform !== "ALL" || selectedCategory !== "ALL") && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
