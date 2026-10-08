"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Search, Sparkles } from "lucide-react";
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
      .catch(() => {
        // Fallback demo data if backend not active
        setCampaigns([
          {
            id: "1",
            title: "Summer Viral Reels Challenge",
            description: "Produce high-energy 9:16 vertical edits highlighting product aesthetics with trendy transitions.",
            category: "Fashion",
            socialPlatform: "Instagram",
            campaignFund: 100000,
            rewardAmount: 100000,
            editorSlots: 10,
            maximumEditorEarning: 8500, // ₹85
            earningPer1000Views: 850, // ₹8.50 per 1k views
            minimumViews: 10000,
            approvedEditorsCount: 6,
            remainingSlots: 4,
            deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
            creator: { name: "Aria Studio", username: "ariastudio" },
          },
          {
            id: "2",
            title: "Tech Unboxing Short Series",
            description: "Edit concise, snappy product unboxings focusing on feature overlays and sound design.",
            category: "Tech",
            socialPlatform: "YouTube",
            campaignFund: 250000,
            rewardAmount: 250000,
            editorSlots: 5,
            maximumEditorEarning: 42500, // ₹425
            earningPer1000Views: 1500, // ₹15.00 per 1k views
            minimumViews: 25000,
            approvedEditorsCount: 2,
            remainingSlots: 3,
            deadline: new Date(Date.now() + 86400000 * 8).toISOString(),
            creator: { name: "Neon Byte", username: "neonbyte" },
          },
        ]);
      })
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

  return (
    <div className="space-y-6">
      {/* Top Featured Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1626] via-[#17345c] to-[#0d213a] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
              <div className="h-5 w-5 rounded-full bg-emerald-500 text-[10px] font-black text-white grid place-items-center">CF</div>
              <span>Featured Creator Brief</span>
              <span className="text-amber-400">✓</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Topps x Clipfarm • Viral Challenge
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
              <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">Verified Brief</span>
              <span>•</span>
              <span className="font-semibold text-emerald-300">811k views target</span>
              <span>•</span>
              <span className="font-black text-white">Earn up to ₹8,500 / editor</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur">
              10 Editor Slots
            </span>
          </div>
        </div>

        {/* Subtle background glow effect */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-navy/40 blur-3xl" />
      </div>

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
            className="w-full rounded-full border border-navy/15 bg-white py-2 pl-10 pr-4 text-xs font-medium outline-none focus:border-navy shadow-sm"
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
                ? "bg-navy text-white shadow-sm"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-navy/10"
            }`}
          >
            {plat === "Instagram" ? "📸 Instagram" : plat === "YouTube" ? "▶ YouTube" : "All Platforms"}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-neutral-400">Loading open campaigns...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center text-neutral-500">
          No published campaigns match your filter. Check back soon!
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
