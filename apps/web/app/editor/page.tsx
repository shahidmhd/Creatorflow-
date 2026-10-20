"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Video,
  ExternalLink,
  AlertCircle,
  Eye,
  Wallet,
  Users,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface EditorStats {
  walletBalance: number;
  totalEarned: number;
  pendingPayouts: number;
  totalVerifiedViews: number;
  activeSubmissions: number;
  approvedSubmissions: number;
  totalSubmissions: number;
  approvalRate: number;
}

interface ActivityItem {
  id: string;
  message: string;
  campaignTitle?: string;
  status: string;
  amount?: number;
  time: string;
  contentUrl?: string;
}

interface FeaturedCampaign {
  id: string;
  title: string;
  description: string;
  category: string;
  socialPlatform: string;
  thumbnail?: string | null;
  campaignFund: number;
  editorRewardPool: number;
  editorSlots: number;
  remainingSlots: number;
  maximumEditorEarning: number;
  earningPer1000Views: number;
  creator?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export default function EditorOverviewPage() {
  const [stats, setStats] = useState<EditorStats>({
    walletBalance: 0,
    totalEarned: 0,
    pendingPayouts: 0,
    totalVerifiedViews: 0,
    activeSubmissions: 0,
    approvedSubmissions: 0,
    totalSubmissions: 0,
    approvalRate: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [featured, setFeatured] = useState<FeaturedCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        stats: EditorStats;
        recentActivities: ActivityItem[];
        featuredCampaign: FeaturedCampaign | null;
      }>("/campaigns/editor/overview");

      if (res?.stats) {
        setStats(res.stats);
      }
      setActivities(res?.recentActivities || []);
      setFeatured(res?.featuredCampaign || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load editor dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const cards = [
    {
      title: "Available Virtual Balance",
      value: `₹${stats.walletBalance.toLocaleString("en-IN")}`,
      subtitle: "Credited 85% payouts ready for withdrawal",
      Icon: Wallet,
      actionHref: "/editor/earnings",
      actionText: "View Wallet",
    },
    {
      title: "Total Verified Views",
      value: stats.totalVerifiedViews.toLocaleString("en-IN"),
      subtitle: "Views delivered across verified clips",
      Icon: Eye,
    },
    {
      title: "Active Submissions",
      value: stats.activeSubmissions.toString(),
      subtitle: "In review or revisions requested",
      Icon: Video,
      actionHref: "/editor/submissions",
      actionText: "Track Clips",
    },
    {
      title: "Approval Rate",
      value: stats.totalSubmissions > 0 ? `${stats.approvalRate}%` : "100%",
      subtitle: `${stats.approvedSubmissions} of ${stats.totalSubmissions} submissions approved`,
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            Editor Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track clip approvals, verified view rewards, and manage your virtual wallet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="icon-button"
            title="Refresh metrics"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-navy" : "text-navy"} />
          </button>
          <Link
            href="/editor/campaigns"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
          >
            <BriefcaseBusiness size={15} /> Browse Campaigns
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800 border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════
              STAT CARDS: 2 COLUMNS IN A ROW (Reviral Navy Theme)
          ══════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map(({ title, value, subtitle, Icon, actionHref, actionText }) => (
              <div
                key={title}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-600">{title}</span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-soft text-navy">
                      <Icon size={16} />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black tracking-[-0.03em] text-neutral-900">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    {subtitle}
                  </p>
                </div>
                {actionHref && (
                  <div className="pt-4 mt-2 border-t border-navy/5">
                    <Link
                      href={actionHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline"
                    >
                      {actionText} <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════
              FEATURED CAMPAIGN CALLOUT (Real Database Record)
          ══════════════════════════════════════════════════ */}
          {featured ? (
            <div className="rounded-3xl border border-navy/10 bg-gradient-to-r from-[#0b1626] via-[#132a4a] to-[#0d213a] p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Featured Opportunity</span>
                  <span className="text-white/40">•</span>
                  <span>{featured.category}</span>
                  <span className="text-white/40">•</span>
                  <span>{featured.socialPlatform}</span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-white">
                  {featured.title}
                </h2>

                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                  {featured.description || "Produce high-converting vertical edits matching brand brief specifications."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <span className="font-black text-emerald-300">
                    Earn up to ₹{featured.maximumEditorEarning.toLocaleString("en-IN")} / editor
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="font-semibold text-white/80">
                    ₹{featured.earningPer1000Views.toLocaleString("en-IN")} / 1k verified views
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="font-semibold text-white/80">
                    {featured.remainingSlots} of {featured.editorSlots} slots left
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <Link
                  href={`/editor/campaigns/${featured.id}`}
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-navy hover:bg-neutral-100 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  View Brief & Apply <ArrowRight size={13} />
                </Link>
                <Link
                  href="/editor/campaigns"
                  className="text-xs font-bold text-white/70 hover:text-white underline"
                >
                  Browse all campaigns
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-navy/10 bg-navy-soft/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-navy" />
                  <h3 className="font-bold text-sm text-neutral-900">
                    Looking for high-payout brand briefs?
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Browse open campaigns, claim approved slots, and earn 85% payouts on every 1,000 verified views.
                </p>
              </div>
              <Link
                href="/editor/campaigns"
                className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 transition shrink-0"
              >
                Browse Campaigns <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              RECENT ACTIVITY TIMELINE (Real Database Events)
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">
                  Recent Activity
                </h2>
                <p className="text-xs font-medium text-neutral-400 mt-0.5">
                  Live updates on clip submissions, brand approvals, and credited rewards.
                </p>
              </div>
              <Link
                href="/editor/submissions"
                className="text-xs font-bold text-navy hover:underline"
              >
                View all submissions
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                No activity recorded yet. Apply to your first campaign to get started!
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-neutral-50/50 px-2 rounded-xl transition"
                  >
                    <div>
                      <p className="font-bold text-sm text-neutral-900">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">
                          {item.time}
                        </span>
                        {item.contentUrl && (
                          <>
                            <span className="text-neutral-300">·</span>
                            <a
                              href={item.contentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-navy hover:underline inline-flex items-center gap-1"
                            >
                              View link <ExternalLink size={11} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
