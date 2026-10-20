"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Plus,
  Eye,
  IndianRupee,
  Calendar,
  Video,
  Users,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface CampaignItem {
  id: string;
  title: string;
  status: string;
  category: string;
  socialPlatform: string;
  rewardAmount: number;
  campaignFund?: number;
  editorRewardPool?: number;
  deadline: string;
  _count?: {
    applications: number;
    submissions?: number;
  };
}

interface SubmissionItem {
  id: string;
  editorId: string;
  contentUrl: string;
  caption?: string;
  notes?: string;
  feedback?: string;
  status: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";
  editor?: {
    id?: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  campaignId: string;
  campaign?: {
    id: string;
    title: string;
    rewardAmount?: number;
    editorRewardPool?: number;
    earningPer1000Views?: number;
    socialPlatform?: string;
  };
  campaignTitle?: string;
  publishedPost?: {
    id: string;
    verifiedViews: number;
    postUrl: string;
  };
  submittedAt?: string;
  createdAt?: string;
}

interface DashboardStats {
  activeCampaigns: number;
  totalPoolRemaining: number;
  walletBalance?: number;
  totalViewsDelivered: number;
  totalSpentThisMonth: number;
  totalApplications: number;
  submissionsToReview: number;
}

export default function CreatorOverviewPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    totalPoolRemaining: 0,
    walletBalance: 0,
    totalViewsDelivered: 0,
    totalSpentThisMonth: 0,
    totalApplications: 0,
    submissionsToReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch real aggregate overview from backend
      const res = await api<{
        stats: DashboardStats;
        pendingSubmissions: SubmissionItem[];
        recentCampaigns: CampaignItem[];
      }>("/campaigns/creator/overview").catch(async () => {
        // Fallback to individual endpoints if aggregated overview is unreachable
        const [camps, walletData] = await Promise.all([
          api<CampaignItem[]>("/campaigns/mine?limit=20").catch(() => [] as CampaignItem[]),
          api<{ balance: number }>("/wallet").catch(() => null),
        ]);
        const campaignList = Array.isArray(camps) ? camps : [];
        const activeCount = campaignList.filter((c) => c.status === "PUBLISHED").length;
        const totalApps = campaignList.reduce((sum, c) => sum + (c._count?.applications ?? 0), 0);
        const activePool =
          campaignList
            .filter((c) => c.status === "PUBLISHED")
            .reduce((sum, c) => sum + (c.editorRewardPool || c.campaignFund || c.rewardAmount || 0), 0) / 100;
        const walletBalMajor = walletData?.balance ? Math.round(walletData.balance / 100) : 0;

        return {
          stats: {
            activeCampaigns: activeCount,
            totalPoolRemaining: Math.round(activePool),
            walletBalance: walletBalMajor,
            totalViewsDelivered: 0,
            totalSpentThisMonth: 0,
            totalApplications: totalApps,
            submissionsToReview: 0,
          },
          pendingSubmissions: [] as SubmissionItem[],
          recentCampaigns: campaignList.slice(0, 5),
        };
      });

      if (res?.stats) {
        setStats(res.stats);
      }
      setSubmissions(res?.pendingSubmissions || []);
      setCampaigns(res?.recentCampaigns || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleApproveSub = async (subId: string) => {
    if (busyId) return;
    setBusyId(subId);
    try {
      await api(`/submissions/${subId}/approve`, { method: "POST" });
      setSubmissions((prev) => prev.filter((s) => s.id !== subId));
      setStats((prev) => ({
        ...prev,
        submissionsToReview: Math.max(0, prev.submissionsToReview - 1),
      }));
      showNotice("Content approved! Editor has been notified to publish the post.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve submission.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectSub = async (subId: string) => {
    if (busyId) return;
    const reason = prompt("Reason for rejection or requested changes (optional):");
    if (reason === null) return;

    setBusyId(subId);
    try {
      await api(`/submissions/${subId}/request-changes`, {
        method: "POST",
        body: JSON.stringify({ feedback: reason || "Changes requested by brand" }),
      });
      setSubmissions((prev) => prev.filter((s) => s.id !== subId));
      setStats((prev) => ({
        ...prev,
        submissionsToReview: Math.max(0, prev.submissionsToReview - 1),
      }));
      showNotice("Feedback sent to editor. Submission marked for revision.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update submission.");
    } finally {
      setBusyId(null);
    }
  };

  const cards = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      subtitle: "Currently accepting submissions",
      Icon: Video,
    },
    {
      title: "Total Pool Remaining",
      value: `₹${stats.totalPoolRemaining.toLocaleString("en-IN")}`,
      subtitle: "Across active campaigns",
      Icon: IndianRupee,
    },
    {
      title: "Total Views Delivered",
      value: stats.totalViewsDelivered.toLocaleString("en-IN"),
      subtitle: "Verified campaign views",
      Icon: Eye,
    },
    {
      title: "Total Spent This Month",
      value: `₹${stats.totalSpentThisMonth.toLocaleString("en-IN")}`,
      subtitle: "Approved creator payouts",
      Icon: Calendar,
    },
    {
      title: "Total Applications",
      value: stats.totalApplications.toString(),
      subtitle: "Creators applied to campaigns",
      Icon: Users,
    },
    {
      title: "Submissions to Review",
      value: stats.submissionsToReview.toString(),
      subtitle: "Clips awaiting your approval",
      Icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            Brand Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor active campaigns, view real-time metrics, and review submissions.
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
            href="/creator/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-navy/90 active:scale-[0.99] transition border border-navy/10"
          >
            <Plus size={15} /> New Campaign
          </Link>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800 border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STAT CARDS: 2 COLUMNS IN A ROW (Reviral Navy Theme)
      ══════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-navy" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map(({ title, value, subtitle, Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
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
            ))}
          </div>

          {/* ══════════════════════════════════════════════════
              RECENT SUBMISSIONS AWAITING REVIEW
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">
                  Recent submissions awaiting review
                </h2>
                <p className="text-xs font-medium text-neutral-400 mt-0.5">
                  Review and approve clips from across your active campaigns.
                </p>
              </div>
              <Link
                href="/creator/campaigns"
                className="text-xs font-bold text-navy hover:underline"
              >
                View all campaigns
              </Link>
            </div>

            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy-soft text-navy mb-3">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm font-bold text-neutral-800">No submissions awaiting review</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  When approved editors upload video clips for your campaigns, they will show up here for you to review and approve.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {submissions.map((sub) => {
                  const editorName = sub.editor?.name || sub.editor?.username || "Editor";
                  const campaignTitle = sub.campaign?.title || sub.campaignTitle || "Campaign";
                  const ratePerK = sub.campaign?.earningPer1000Views
                    ? Math.round(sub.campaign.earningPer1000Views / 100)
                    : null;
                  const verifiedViews = sub.publishedPost?.verifiedViews;

                  return (
                    <div
                      key={sub.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-neutral-900">
                            {editorName}
                          </span>
                          <span className="text-neutral-300 font-bold">·</span>
                          <span className="text-sm font-medium text-neutral-600 truncate">
                            {campaignTitle}
                          </span>
                        </div>

                        {sub.caption && (
                          <p className="text-xs text-neutral-600 italic mt-1 line-clamp-1">
                            &ldquo;{sub.caption}&rdquo;
                          </p>
                        )}

                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
                          {verifiedViews !== undefined ? (
                            <span className="font-semibold text-emerald-600">
                              {verifiedViews.toLocaleString("en-IN")} verified views
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-600">
                              Awaiting brand approval
                            </span>
                          )}
                          {ratePerK && (
                            <>
                              <span>·</span>
                              <span>₹{ratePerK} / 1k views</span>
                            </>
                          )}
                          {sub.submittedAt && (
                            <>
                              <span>·</span>
                              <span>
                                {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </>
                          )}
                        </p>

                        <a
                          href={sub.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-navy hover:underline mt-2 inline-flex items-center gap-1"
                        >
                          Open submitted clip <ExternalLink size={11} />
                        </a>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveSub(sub.id)}
                          disabled={busyId === sub.id}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                        >
                          {busyId === sub.id ? "Approving…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectSub(sub.id)}
                          disabled={busyId === sub.id}
                          className="rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 transition disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              ACTIVE CAMPAIGNS SECTION
          ══════════════════════════════════════════════════ */}
          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy-soft text-navy mb-3">
                <Video size={20} />
              </div>
              <h3 className="text-sm font-black text-neutral-900">No campaigns launched yet</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Create your first performance campaign to invite editors and start generating viral short-form clips.
              </p>
              <Link
                href="/creator/campaigns/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy/90 transition"
              >
                <Plus size={14} /> Create Campaign
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-navy/5">
                <h2 className="text-sm font-black tracking-[-0.02em] text-neutral-900 flex items-center gap-2">
                  <TrendingUp size={15} className="text-navy" /> Active Campaigns
                </h2>
                <Link
                  href="/creator/campaigns"
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              <div className="divide-y divide-neutral-100">
                {campaigns.map((c) => {
                  const gross = Math.round((c.editorRewardPool || c.campaignFund || c.rewardAmount) / 100);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-neutral-50/60 transition"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/creator/campaigns/${c.id}`}
                          className="block font-bold text-sm text-neutral-900 hover:text-navy hover:underline truncate"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {c.socialPlatform} · {c.category} · Budget: ₹{gross.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={c.status} />
                        <Link
                          href={`/creator/campaigns/${c.id}`}
                          className="rounded-full border border-navy/20 bg-white px-3 py-1 text-xs font-bold text-navy hover:bg-navy-soft transition"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
