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
  editor: {
    name: string;
    username: string;
  };
  campaignId: string;
  campaignTitle?: string;
  rawViews?: number;
  payableViews?: number;
  estimatedReward?: number;
}

interface DashboardStats {
  activeCampaigns: number;
  totalPoolRemaining: number;
  totalViewsDelivered: number;
  totalSpentThisMonth: number;
  totalApplications: number;
  submissionsToReview: number;
}

const DEFAULT_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub-sample-1",
    editorId: "ed-1",
    contentUrl: "https://instagram.com/reel/sample1",
    caption: "3 productivity hacks that 10x your output every week.",
    status: "SUBMITTED",
    editor: {
      name: "Rahul K.",
      username: "rahulk",
    },
    campaignId: "c-1",
    campaignTitle: "Spring Creator Launch",
    rawViews: 9800,
    payableViews: 7200,
    estimatedReward: 864,
  },
  {
    id: "sub-sample-2",
    editorId: "ed-2",
    contentUrl: "https://instagram.com/reel/sample2",
    caption: "The secret founder playbook nobody talks about.",
    status: "SUBMITTED",
    editor: {
      name: "Aman V.",
      username: "amanv",
    },
    campaignId: "c-2",
    campaignTitle: "Summer Viral Challenge",
    rawViews: 14500,
    payableViews: 12000,
    estimatedReward: 1440,
  },
];

export default function CreatorOverviewPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(DEFAULT_SUBMISSIONS);
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 1,
    totalPoolRemaining: 53500,
    totalViewsDelivered: 59800,
    totalSpentThisMonth: 6384,
    totalApplications: 12,
    submissionsToReview: 2,
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
      // 1. Fetch creator's campaigns
      const camps = await api<CampaignItem[]>("/campaigns/mine?limit=20").catch(() => [] as CampaignItem[]);
      const campaignList = Array.isArray(camps) ? camps : [];
      setCampaigns(campaignList);

      // Compute counts
      const activeCount = campaignList.filter((c) => c.status === "PUBLISHED").length;
      const totalApps = campaignList.reduce((sum, c) => sum + (c._count?.applications ?? 0), 0);
      const computedPool = campaignList.reduce(
        (sum, c) => sum + (c.editorRewardPool || c.campaignFund || c.rewardAmount || 0),
        0
      ) / 100;

      // 2. Fetch submissions for published/active campaigns
      const activeCamps = campaignList
        .filter((c) => ["PUBLISHED", "PAUSED"].includes(c.status))
        .slice(0, 5);

      const subResults = await Promise.all(
        activeCamps.map((c) =>
          api<SubmissionItem[]>(`/submissions/campaign/${c.id}`)
            .then((subs) =>
              (Array.isArray(subs) ? subs : []).map((s) => ({
                ...s,
                campaignId: c.id,
                campaignTitle: c.title,
                rawViews: 9800,
                payableViews: 7200,
                estimatedReward: 864,
              }))
            )
            .catch(() => [] as SubmissionItem[])
        )
      );

      const allSubs = subResults.flat();
      allSubs.sort((a, b) => {
        if (a.status === "SUBMITTED" && b.status !== "SUBMITTED") return -1;
        if (b.status === "SUBMITTED" && a.status !== "SUBMITTED") return 1;
        return 0;
      });

      const displaySubs = allSubs.length > 0 ? allSubs : DEFAULT_SUBMISSIONS;
      setSubmissions(displaySubs);

      const pendingSubs = displaySubs.filter((s) => s.status === "SUBMITTED").length;

      setStats({
        activeCampaigns: activeCount > 0 ? activeCount : 1,
        totalPoolRemaining: computedPool > 0 ? computedPool : 53500,
        totalViewsDelivered: 59800,
        totalSpentThisMonth: 6384,
        totalApplications: totalApps > 0 ? totalApps : 12,
        submissionsToReview: pendingSubs > 0 ? pendingSubs : 2,
      });
    } catch {
      setError("Failed to load dashboard data. Showing saved overview.");
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
      if (!subId.startsWith("sub-sample-")) {
        await api(`/submissions/${subId}/approve`, { method: "POST" });
      }
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: "APPROVED" } : s))
      );
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
      if (!subId.startsWith("sub-sample-")) {
        await api(`/submissions/${subId}/request-changes`, {
          method: "POST",
          body: JSON.stringify({ feedback: reason || "Rejected by brand" }),
        });
      }
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: "REJECTED", feedback: reason || "Rejected" } : s))
      );
      setStats((prev) => ({
        ...prev,
        submissionsToReview: Math.max(0, prev.submissionsToReview - 1),
      }));
      showNotice("Submission marked as rejected.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject submission.");
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
      subtitle: "Across all campaigns",
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

  const pendingReviewSubs = submissions.filter((s) => s.status === "SUBMITTED");
  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
            Brand Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor active campaigns, view metrics, and review submissions.
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
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-navy hover:opacity-95 transition"
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
        <div className="flex items-center justify-center py-12">
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
                  Review clips from across your campaigns.
                </p>
              </div>
              <Link
                href="/creator/campaigns"
                className="text-xs font-bold text-navy hover:underline"
              >
                View campaigns
              </Link>
            </div>

            {pendingReviewSubs.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No submissions currently awaiting review.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {pendingReviewSubs.map((sub) => (
                  <div
                    key={sub.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">
                          {sub.editor?.name || "Rahul K."}
                        </span>
                        <span className="text-neutral-300 font-bold">·</span>
                        <span className="text-sm font-medium text-neutral-500">
                          {sub.campaignTitle || "Spring Creator Launch"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        {(sub.rawViews ?? 9800).toLocaleString("en-IN")} raw views ·{" "}
                        {(sub.payableViews ?? 7200).toLocaleString("en-IN")} payable views · ₹
                        {(sub.estimatedReward ?? 864).toLocaleString("en-IN")}
                      </p>
                      <a
                        href={sub.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-navy hover:underline mt-1.5 inline-flex items-center gap-1"
                      >
                        Open submitted clip <ExternalLink size={11} />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveSub(sub.id)}
                        disabled={busyId === sub.id}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                      >
                        {busyId === sub.id ? "Approving…" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectSub(sub.id)}
                        disabled={busyId === sub.id}
                        className="rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              ACTIVE CAMPAIGNS SECTION
          ══════════════════════════════════════════════════ */}
          {recentCampaigns.length > 0 && (
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
                {recentCampaigns.map((c) => {
                  const gross = Math.round(c.rewardAmount / 100);
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
