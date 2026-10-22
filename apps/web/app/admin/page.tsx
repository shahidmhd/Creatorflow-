"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  History,
  Layers,
  RefreshCw,
  ShieldAlert,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { api } from "../api";
import { formatPaise, formatDate, type AdminStats } from "./data";
import { StatusBadge } from "@/app/components";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await api<AdminStats>("/admin/stats");
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platform statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const creatorCount = stats?.usersByRole?.find((r) => r.role === "CREATOR")?._count ?? 0;
  const editorCount = stats?.usersByRole?.find((r) => r.role === "EDITOR")?._count ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-navy">Live Platform Overview</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.06em] md:text-4xl text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Real-time ledger volume, campaign moderations, and platform operations.
          </p>
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-navy" : "text-neutral-500"} />
          {refreshing ? "Refreshing..." : "Refresh Live Data"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Live platform metrics">
        {/* Total GMV */}
        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gross GMV Processed</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CircleDollarSign size={18} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-black tracking-[-0.05em] text-neutral-900">
            {loading ? "..." : formatPaise(stats?.totalGMV ?? 0)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">Total creator funds deposited into campaigns</p>
        </article>

        {/* Platform Fees Earned */}
        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Platform Fees Retained</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-soft text-navy">
              <CircleDollarSign size={18} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-black tracking-[-0.05em] text-navy">
            {loading ? "..." : formatPaise(stats?.totalPlatformFeesEarned ?? 0)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">Platform commission earned from verified payouts</p>
        </article>

        {/* Disbursed to Editors */}
        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Editor Rewards Disbursed</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Wallet size={18} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-black tracking-[-0.05em] text-neutral-900">
            {loading ? "..." : formatPaise(stats?.totalDisbursedToEditors ?? 0)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">Net earnings paid out to editors for verified clips</p>
        </article>

        {/* Total Users */}
        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Platform Users</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-black tracking-[-0.05em] text-neutral-900">
            {loading ? "..." : (stats?.users ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {creatorCount} Brands/Creators · {editorCount} Editors
          </p>
        </article>
      </section>

      {/* Secondary Metrics Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-navy/10 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">Active Campaigns</p>
            <p className="text-xl font-black text-neutral-900 mt-0.5">{stats?.activeCampaigns ?? 0} Live</p>
          </div>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
            {stats?.totalCampaigns ?? 0} total
          </span>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">Submissions</p>
            <p className="text-xl font-black text-neutral-900 mt-0.5">{stats?.totalSubmissions ?? 0} Clips</p>
          </div>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
            Review queue
          </span>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">Verified Posts</p>
            <p className="text-xl font-black text-neutral-900 mt-0.5">{stats?.totalPublishedPosts ?? 0} Live</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            Published
          </span>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase">Escrow In Wallets</p>
            <p className="text-xl font-black text-navy mt-0.5">{formatPaise(stats?.totalWalletBalance ?? 0)}</p>
          </div>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
            Balances
          </span>
        </div>
      </section>

      {/* Main Content Split: Recent Campaigns & Live Activity */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        {/* Left: Recent Campaigns */}
        <article className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
            <div>
              <h2 className="font-black text-lg text-neutral-900">Recent Platform Campaigns</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Live marketplace briefs and funding pools</p>
            </div>
            <Link href="/admin/campaigns" className="text-xs font-bold text-navy hover:underline">
              View all campaigns →
            </Link>
          </div>

          <div className="divide-y divide-black/5">
            {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
              stats.recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/admin/campaigns/${campaign.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-sm text-neutral-900">{campaign.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>{campaign.creator?.name || "Creator"}</span>
                      <span>•</span>
                      <span>{campaign.socialPlatform}</span>
                      <span>•</span>
                      <span>Fund: <strong className="text-neutral-800">{formatPaise(campaign.campaignFund)}</strong></span>
                      <span>•</span>
                      <span>{campaign._count?.submissions ?? 0} submissions</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={campaign.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <BriefcaseBusiness size={28} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-sm font-semibold text-neutral-500">No campaigns found in database.</p>
              </div>
            )}
          </div>
        </article>

        {/* Right: Live Audit Log & Reports Card */}
        <div className="space-y-6">
          {/* Unresolved Reports Card */}
          <article className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black text-base text-neutral-900">Disputes & Flags Queue</h2>
                <p className="mt-1 text-xs text-neutral-500">User disputes and moderation flags</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={18} />
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-neutral-900">{stats?.pendingReports ?? 0}</span>
              <span className="text-xs font-semibold text-neutral-500">unresolved issues</span>
            </div>

            <Link
              href="/admin/reports"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy/90"
            >
              Open Reports Queue <ArrowUpRight size={14} />
            </Link>
          </article>

          {/* Live System Activity Feed */}
          <article className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <History size={16} className="text-navy" />
                <h3 className="font-bold text-sm text-neutral-900">Recent System Activity</h3>
              </div>
              <Link href="/admin/audit-logs" className="text-xs font-bold text-navy hover:underline">
                All Logs
              </Link>
            </div>

            <div className="divide-y divide-black/5 text-xs">
              {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-neutral-50/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-neutral-800">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-neutral-500">
                      Entity: <span className="font-semibold text-neutral-700">{log.entity}</span>
                      {log.actor && (
                        <span> by <strong className="text-neutral-700">{log.actor.name}</strong> ({log.actor.role})</span>
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-neutral-400">No recent activity logs recorded yet.</div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
