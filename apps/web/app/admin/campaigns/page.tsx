"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ExternalLink,
  Filter,
  Pause,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";
import { formatPaise, formatDate, type AdminCampaign, type AdminCampaignStatus } from "../data";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await api<{ campaigns: AdminCampaign[]; total: number }>("/admin/campaigns?limit=50");
      setCampaigns(res.campaigns || []);
      setTotal(res.total || 0);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AdminCampaignStatus) => {
    setActionLoadingId(id);
    try {
      await api(`/admin/campaigns/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      // Optimistic state update
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setNotice(`Campaign status changed to ${newStatus}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to update campaign status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.creator?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.creator?.username?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase()) ||
        c.socialPlatform?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Campaign Oversight</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Live database moderation of briefs, escrow pools, and creator compliance.
          </p>
        </div>

        <button
          onClick={fetchCampaigns}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-navy" : "text-neutral-500"} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-navy/15 bg-navy-soft/60 px-4 py-3 text-xs font-semibold text-navy">
          {notice}
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, creator, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-black/10 bg-white p-1 text-xs">
          {["ALL", "PUBLISHED", "PAUSED", "COMPLETED", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 font-bold transition ${
                statusFilter === status
                  ? "bg-navy text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
              <tr>
                <th className="p-4">Campaign Details</th>
                <th className="p-4">Brand / Creator</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Total Fund</th>
                <th className="p-4">Editor Pool</th>
                <th className="p-4">Clips / Slots</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    <RefreshCw size={20} className="mx-auto animate-spin mb-2 text-navy" />
                    Loading campaigns from database...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No campaigns match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 transition">
                    <td className="p-4">
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="font-bold text-neutral-900 hover:text-navy hover:underline block truncate max-w-xs"
                      >
                        {c.title}
                      </Link>
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">
                        Category: {c.category || "General"}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-neutral-800">{c.creator?.name || "Unknown"}</p>
                      <p className="text-[10px] text-neutral-400">@{c.creator?.username || "creator"}</p>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 font-bold text-neutral-700">
                        {c.socialPlatform}
                      </span>
                    </td>

                    <td className="p-4 font-black text-neutral-900">
                      {formatPaise(c.campaignFund)}
                    </td>

                    <td className="p-4 font-black text-navy">
                      {formatPaise(c.editorRewardPool || c.campaignFund * 0.85)}
                    </td>

                    <td className="p-4 text-neutral-600">
                      <span className="font-bold text-neutral-900">{c._count?.submissions ?? 0}</span> clips /{" "}
                      <span className="font-semibold text-neutral-500">{c.editorSlots ?? 1} slots</span>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {c.status === "PUBLISHED" ? (
                          <button
                            onClick={() => handleStatusChange(c.id, "PAUSED")}
                            disabled={actionLoadingId === c.id}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                          >
                            <Pause size={11} /> Pause
                          </button>
                        ) : c.status === "PAUSED" ? (
                          <button
                            onClick={() => handleStatusChange(c.id, "PUBLISHED")}
                            disabled={actionLoadingId === c.id}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            <Play size={11} /> Resume
                          </button>
                        ) : c.status === "DRAFT" ? (
                          <button
                            onClick={() => handleStatusChange(c.id, "PUBLISHED")}
                            disabled={actionLoadingId === c.id}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                          >
                            <Play size={11} /> Publish
                          </button>
                        ) : null}

                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          className="rounded-full border border-navy/20 px-2.5 py-1 text-[11px] font-bold text-navy hover:bg-navy-soft transition"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
