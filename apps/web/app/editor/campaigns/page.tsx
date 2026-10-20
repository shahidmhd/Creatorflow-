"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Search, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/app/api";
import { CampaignCard, CampaignCardData } from "@/app/components";

export default function EditorBrowseCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");

  useEffect(() => {
    api<CampaignCardData[]>("/campaigns")
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "ALL" || c.socialPlatform.toLowerCase() === selectedPlatform.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const featured = campaigns.length > 0 ? campaigns[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Featured Hero Banner — Dynamic from real campaign */}
      {featured ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1626] via-[#17345c] to-[#0d213a] p-6 sm:p-8 text-white shadow-sm border border-white/10">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Featured Creator Brief</span>
                <span className="text-white/40">•</span>
                <span>{featured.category}</span>
                <span className="text-white/40">•</span>
                <span>{featured.socialPlatform}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {featured.title}
              </h2>

              <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                {featured.description || "Produce high-converting vertical edits matching brand brief specifications."}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">Verified Brief</span>
                <span>•</span>
                <span className="font-semibold text-emerald-300">
                  Earn up to ₹{Math.round((featured.maximumEditorEarning || 0) / 100).toLocaleString("en-IN")} / editor
                </span>
                <span>•</span>
                <span className="font-black text-white">
                  ₹{Math.round((featured.earningPer1000Views || 0) / 100).toLocaleString("en-IN")} / 1k views
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur-xs">
                {featured.remainingSlots ?? featured.editorSlots} Slots Open
              </span>
              <Link
                href={`/editor/campaigns/${featured.id}`}
                className="rounded-full bg-white px-5 py-2 text-xs font-black text-navy hover:bg-neutral-100 transition shadow-sm inline-flex items-center gap-1.5"
              >
                View Brief <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Subtle background glow effect */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-navy/40 blur-3xl" />
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

      {/* Header and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
            <Flame size={15} /> Active Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.05em] text-neutral-900 mt-1 flex items-center gap-2">
            <span>Campaigns for you</span>
            <span className="text-neutral-400 text-xl font-normal">&gt;</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Instagram and YouTube briefs with slot-based pools and verified view rewards.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-navy/15 bg-white py-2 pl-10 pr-4 text-xs font-medium outline-none focus:border-navy shadow-xs"
          />
        </div>
      </div>

      {/* Filter Pills strictly for Instagram and YouTube */}
      <div className="flex flex-wrap items-center gap-2 border-y border-navy/10 py-3">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">Platform:</span>
        {["ALL", "Instagram", "YouTube"].map((plat) => (
          <button
            key={plat}
            onClick={() => setSelectedPlatform(plat)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              selectedPlatform.toUpperCase() === plat.toUpperCase()
                ? "bg-navy text-white shadow-xs"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-navy/10"
            }`}
          >
            {plat === "Instagram" ? "📸 Instagram" : plat === "YouTube" ? "▶ YouTube" : "All Platforms"}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center text-neutral-500 text-sm">
          No published campaigns match your filter. Check back soon for new brand briefs!
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
