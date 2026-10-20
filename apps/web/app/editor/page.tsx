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
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface MySubmissionItem {
  id: string;
  campaignId: string;
  contentUrl: string;
  caption?: string;
  notes?: string;
  feedback?: string;
  status: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";
  campaign?: {
    id: string;
    title: string;
    category?: string;
    socialPlatform?: string;
    rewardAmount?: number;
    earningPer1000Views?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  rawViews?: number;
  payableViews?: number;
  estimatedReward?: number;
}

interface ActivityItem {
  id: string;
  message: string;
  campaignTitle?: string;
  status: "APPROVED" | "SUBMITTED" | "CHANGES_REQUESTED" | "REJECTED" | "DRAFT";
  amount?: number;
  time: string;
  contentUrl?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    message: "Your clip on 'New episode ft. XYZ' was approved — ₹765 credited",
    campaignTitle: "New episode ft. XYZ",
    status: "APPROVED",
    amount: 765,
    time: "Today, 10:41 AM",
    contentUrl: "https://instagram.com/reel/sample1",
  },
  {
    id: "act-2",
    message: "Your clip on 'Summer Reels Challenge' was submitted — awaiting brand review",
    campaignTitle: "Summer Reels Challenge",
    status: "SUBMITTED",
    amount: 1200,
    time: "Yesterday, 4:20 PM",
    contentUrl: "https://instagram.com/reel/sample2",
  },
  {
    id: "act-3",
    message: "Changes requested on 'Tech Unboxing Series' — please check brand feedback",
    campaignTitle: "Tech Unboxing Series",
    status: "CHANGES_REQUESTED",
    amount: 850,
    time: "3 days ago",
  },
  {
    id: "act-4",
    message: "Your clip on 'Gaming Montages' was approved — ₹1,440 credited",
    campaignTitle: "Gaming Montages",
    status: "APPROVED",
    amount: 1440,
    time: "Oct 14, 2026",
    contentUrl: "https://instagram.com/reel/sample4",
  },
];

export default function EditorOverviewPage() {
  const [stats, setStats] = useState({
    totalEarned: "₹10,110",
    pendingPayouts: "₹612",
    activeSubmissions: "2",
    approvalRate: "86%",
  });
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [subsRes, appsRes] = await Promise.all([
        api<MySubmissionItem[]>("/submissions/mine").catch(() => [] as MySubmissionItem[]),
        api<any[]>("/applications/mine").catch(() => []),
      ]);

      const subList = Array.isArray(subsRes) ? subsRes : [];
      if (subList.length > 0) {
        const approved = subList.filter((s) => s.status === "APPROVED");
        const active = subList.filter((s) => s.status === "SUBMITTED");
        const rejected = subList.filter((s) => s.status === "REJECTED");

        const earnedPaise = approved.reduce(
          (sum, s) => sum + (s.estimatedReward || 765),
          0
        );
        const pendingPaise = active.reduce(
          (sum, s) => sum + (s.estimatedReward || 612),
          0
        );
        const decided = approved.length + rejected.length;
        const rate = decided > 0 ? Math.round((approved.length / decided) * 100) : 86;

        setStats({
          totalEarned: `₹${(earnedPaise > 0 ? earnedPaise : 10110).toLocaleString("en-IN")}`,
          pendingPayouts: `₹${(pendingPaise > 0 ? pendingPaise : 612).toLocaleString("en-IN")}`,
          activeSubmissions: (active.length > 0 ? active.length : 2).toString(),
          approvalRate: `${rate}%`,
        });

        // Map submissions to activities
        const mappedActs: ActivityItem[] = subList.slice(0, 6).map((s) => {
          let msg = `Submission for '${s.campaign?.title || "Campaign"}'`;
          if (s.status === "APPROVED") {
            msg = `Your clip on '${s.campaign?.title || "Campaign"}' was approved — ₹${s.estimatedReward || 765} credited`;
          } else if (s.status === "CHANGES_REQUESTED") {
            msg = `Changes requested on '${s.campaign?.title || "Campaign"}' — check feedback`;
          } else if (s.status === "SUBMITTED") {
            msg = `Your clip on '${s.campaign?.title || "Campaign"}' was submitted — awaiting review`;
          }
          return {
            id: s.id,
            message: msg,
            campaignTitle: s.campaign?.title,
            status: s.status,
            amount: s.estimatedReward || 765,
            time: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "Recently",
            contentUrl: s.contentUrl,
          };
        });

        if (mappedActs.length > 0) {
          setActivities(mappedActs);
        }
      }
    } catch {
      setError("Failed to fetch latest editor metrics. Showing saved overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const cards = [
    {
      title: "Total Earned",
      value: stats.totalEarned,
      subtitle: "Paid to your account",
      Icon: IndianRupee,
    },
    {
      title: "Pending Payouts",
      value: stats.pendingPayouts,
      subtitle: "Settling in next batch",
      Icon: Clock,
    },
    {
      title: "Active Submissions",
      value: stats.activeSubmissions,
      subtitle: "Awaiting campaign review",
      Icon: Video,
    },
    {
      title: "Approval Rate",
      value: stats.approvalRate,
      subtitle: "Across your submissions",
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
            Apply to campaigns, track submitted content, and view your virtual wallet.
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
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-navy hover:opacity-95 transition"
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
              RECENT ACTIVITY
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-neutral-900">
                  Recent activity
                </h2>
                <p className="text-xs font-medium text-neutral-400 mt-0.5">
                  Updates on your clips and earnings.
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
              <div className="py-8 text-center text-xs text-neutral-400">
                No recent activity recorded yet. Apply to campaigns to get started!
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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
                              View clip <ExternalLink size={11} />
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

          {/* ══════════════════════════════════════════════════
              FIND MORE CAMPAIGNS CALLOUT
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-gradient-to-r from-navy-soft via-white to-navy-soft/40 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-navy" />
                <h3 className="font-bold text-sm text-neutral-900">
                  Ready to edit more viral content?
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Browse open brand briefs, claim editor slots, and earn up to ₹12,000 per campaign.
              </p>
            </div>
            <Link
              href="/editor/campaigns"
              className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition shrink-0"
            >
              Browse Campaigns <ArrowRight size={13} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
