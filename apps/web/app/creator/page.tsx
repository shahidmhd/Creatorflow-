"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  ClipboardList,
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
}

interface DashboardStats {
  activeCampaigns: number;
  pendingApplications: number;
  submissionsToReview: number;
  rewardsCredited: number;
}

export default function CreatorOverviewPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    pendingApplications: 0,
    submissionsToReview: 0,
    rewardsCredited: 0,
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
      // Fetch creator's campaigns
      const camps = await api<CampaignItem[]>("/campaigns/mine?limit=20").catch(() => [] as CampaignItem[]);
      const campaignList = Array.isArray(camps) ? camps : [];
      setCampaigns(campaignList);

      // Compute stats
      const active = campaignList.filter((c) => c.status === "PUBLISHED").length;
      const pendingApps = campaignList.reduce((sum, c) => sum + (c._count?.applications ?? 0), 0);

      // Fetch submissions for each published/active campaign (up to 5)
      const activeCamps = campaignList.filter((c) =>
        ["PUBLISHED", "PAUSED"].includes(c.status)
      ).slice(0, 5);

      const subResults = await Promise.all(
        activeCamps.map((c) =>
          api<SubmissionItem[]>(`/submissions/campaign/${c.id}`)
            .then((subs) =>
              (Array.isArray(subs) ? subs : []).map((s) => ({
                ...s,
                campaignId: c.id,
                campaignTitle: c.title,
              }))
            )
            .catch(() => [] as SubmissionItem[])
        )
      );

      const allSubs = subResults.flat();
      // Sort: SUBMITTED first (need action), then others
      allSubs.sort((a, b) => {
        if (a.status === "SUBMITTED" && b.status !== "SUBMITTED") return -1;
        if (b.status === "SUBMITTED" && a.status !== "SUBMITTED") return 1;
        return 0;
      });
      setSubmissions(allSubs);

      const pendingSubs = allSubs.filter((s) => s.status === "SUBMITTED").length;

      setStats({
        activeCampaigns: active,
        pendingApplications: pendingApps,
        submissionsToReview: pendingSubs,
        rewardsCredited: 0,
      });
    } catch {
      setError("Failed to load dashboard data.");
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

  const handleRequestChanges = async (subId: string) => {
    if (busyId) return;
    const reason = prompt("Enter requested changes for the editor:");
    if (!reason) return;

    setBusyId(subId);
    try {
      await api(`/submissions/${subId}/request-changes`, {
        method: "POST",
        body: JSON.stringify({ feedback: reason }),
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === subId ? { ...s, status: "CHANGES_REQUESTED", feedback: reason } : s
        )
      );
      setStats((prev) => ({
        ...prev,
        submissionsToReview: Math.max(0, prev.submissionsToReview - 1),
      }));
      showNotice("Feedback sent to editor.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request changes.");
    } finally {
      setBusyId(null);
    }
  };

  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">
            Creator Overview
          </h1>
          <p className="text-sm text-neutral-500">
            Monitor active campaigns, submissions, and reward release statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="icon-button"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/creator/campaigns/new"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-95"
          >
            <Plus size={16} /> New Campaign
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
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Active Campaigns", val: stats.activeCampaigns, icon: TrendingUp },
              { label: "Total Applications", val: stats.pendingApplications, icon: Users },
              { label: "Submissions to Review", val: stats.submissionsToReview, icon: Sparkles },
              { label: "Rewards Credited", val: "—", icon: CheckCircle2 },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                  <Icon size={18} className="text-navy" />
                </div>
                <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-navy">{val}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Recent Campaigns ── */}
            <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-navy/5">
                <h2 className="text-base font-black tracking-[-0.03em] text-neutral-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-navy" /> Recent Campaigns
                </h2>
                <Link
                  href="/creator/campaigns"
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {recentCampaigns.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-neutral-400">
                  No campaigns yet.{" "}
                  <Link href="/creator/campaigns/new" className="font-bold text-navy hover:underline">
                    Create your first →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {recentCampaigns.map((c) => {
                    const gross = Math.round(c.rewardAmount / 100);
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50/60 transition"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/creator/campaigns/${c.id}`}
                            className="block font-bold text-sm text-neutral-900 hover:text-navy hover:underline truncate"
                          >
                            {c.title}
                          </Link>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {c.socialPlatform} · {c.category} · Reward: ₹{gross.toLocaleString("en-IN")}
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
              )}
            </div>

            {/* ── Recent Submissions ── */}
            <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-navy/5">
                <h2 className="text-base font-black tracking-[-0.03em] text-neutral-900 flex items-center gap-2">
                  <ClipboardList size={16} className="text-navy" /> Recent Submissions
                  {stats.submissionsToReview > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black w-5 h-5">
                      {stats.submissionsToReview}
                    </span>
                  )}
                </h2>
              </div>

              {submissions.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-neutral-400">
                  No submissions yet across your active campaigns.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 max-h-[440px] overflow-y-auto">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="px-6 py-4 space-y-2 hover:bg-neutral-50/50 transition">
                      {/* Editor + Campaign + Status row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-neutral-900">
                              {sub.editor?.name || "Editor"}
                            </span>
                            <span className="text-xs text-neutral-400">@{sub.editor?.username}</span>
                            <StatusBadge status={sub.status} />
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5 truncate">
                            Campaign:{" "}
                            <Link
                              href={`/creator/campaigns/${sub.campaignId}`}
                              className="font-semibold text-navy hover:underline"
                            >
                              {sub.campaignTitle || sub.campaignId}
                            </Link>
                          </p>
                          {sub.caption && (
                            <p className="text-xs text-neutral-500 mt-1 italic truncate">
                              &ldquo;{sub.caption}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content URL + feedback */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={sub.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-surface px-3 py-1 text-xs font-bold text-navy hover:bg-navy-soft transition"
                        >
                          <ExternalLink size={12} /> View Content
                        </a>
                      </div>

                      {sub.feedback && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg font-semibold border border-amber-200">
                          Change Request: {sub.feedback}
                        </p>
                      )}

                      {/* Action buttons — only for SUBMITTED */}
                      {sub.status === "SUBMITTED" && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleRequestChanges(sub.id)}
                            disabled={busyId === sub.id}
                            className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition"
                          >
                            Request Changes
                          </button>
                          <button
                            onClick={() => handleApproveSub(sub.id)}
                            disabled={busyId === sub.id}
                            className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white shadow-navy hover:opacity-90 disabled:opacity-50 transition"
                          >
                            {busyId === sub.id ? "Approving…" : "Approve"}
                          </button>
                        </div>
                      )}

                      {/* Already actioned — show link to full detail */}
                      {sub.status !== "SUBMITTED" && (
                        <div className="flex justify-end">
                          <Link
                            href={`/creator/campaigns/${sub.campaignId}`}
                            className="text-xs font-bold text-neutral-400 hover:text-navy hover:underline"
                          >
                            View Campaign →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
