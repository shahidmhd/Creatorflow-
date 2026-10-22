"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle,
  ExternalLink,
  Layers,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";
import { formatPaise, formatDate, type AdminCampaignStatus } from "../../data";

interface CampaignDetail {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  socialPlatform: string;
  videoUrl: string | null;
  rewardAmount: number;
  maxEarn: number | null;
  campaignFund: number;
  platformFeePercentage: number;
  platformFee: number;
  editorRewardPool: number;
  editorSlots: number;
  maximumEditorEarning: number;
  earningPer1000Views: number;
  currency: string;
  deadline: string;
  contentRequirements: string | null;
  captionRequirements: string | null;
  hashtagRequirements: string | null;
  mentionRequirements: string | null;
  minimumViews: number;
  minimumEngagement: number;
  additionalInstructions: string | null;
  status: AdminCampaignStatus;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    applications: number;
    submissions: number;
  };
  rewards?: Array<{
    grossAmount: number;
    netAmount: number;
    platformFee: number;
    verifiedViews: number;
  }>;
  approvedEditorsCount: number;
  remainingSlots: number;
  editorRewardPoolRemaining: number;
  campaignFundRemaining: number;
  totalPaidNet: number;
  totalDisbursedGross: number;
}

export default function AdminCampaignDetailPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchCampaign = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api<CampaignDetail>(`/campaigns/${params.campaignId}`);
      setCampaign(res);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to load campaign details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.campaignId) {
      fetchCampaign();
    }
  }, [params.campaignId]);

  const handleStatusUpdate = async (newStatus: AdminCampaignStatus) => {
    if (!campaign) return;
    setUpdating(true);
    setMessage(null);

    try {
      await api(`/admin/campaigns/${campaign.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setCampaign((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setMessage({
        text: `Campaign successfully updated to ${newStatus}.`,
        type: "success",
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-sm font-semibold text-neutral-500">
        <RefreshCw size={24} className="mx-auto animate-spin mb-3 text-navy" />
        Loading campaign details from database...
      </div>
    );
  }

  if (!campaign) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <BriefcaseBusiness size={32} className="mx-auto text-neutral-400 mb-3" />
        <h1 className="text-xl font-black text-neutral-900">Campaign Not Found</h1>
        <p className="mt-1 text-xs text-neutral-500">The requested campaign does not exist or was deleted.</p>
        <Link
          href="/admin/campaigns"
          className="mt-5 inline-flex rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-navy"
        >
          Back to Campaigns
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 transition hover:text-navy"
        >
          <ArrowLeft size={14} /> Back to campaigns
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">Marketplace Campaign</span>
              <StatusBadge status={campaign.status} />
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-[-0.05em] text-neutral-900">
              {campaign.title}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Created on {formatDate(campaign.createdAt)} · Category: {campaign.category} · Platform: {campaign.socialPlatform}
            </p>
          </div>

          {/* Quick Moderation Status Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {campaign.status === "PUBLISHED" && (
              <button
                onClick={() => handleStatusUpdate("PAUSED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
              >
                <Pause size={13} /> {updating ? "Updating..." : "Pause Campaign"}
              </button>
            )}

            {campaign.status === "PAUSED" && (
              <button
                onClick={() => handleStatusUpdate("PUBLISHED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                <Play size={13} /> {updating ? "Updating..." : "Resume Campaign"}
              </button>
            )}

            {campaign.status === "DRAFT" && (
              <button
                onClick={() => handleStatusUpdate("PUBLISHED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
              >
                <Play size={13} /> {updating ? "Updating..." : "Approve & Publish"}
              </button>
            )}

            {campaign.status !== "COMPLETED" && campaign.status !== "CANCELLED" && (
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                <CheckCircle size={13} /> Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 text-xs font-semibold ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Financial Ledger Breakdown */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase text-neutral-400">Total Campaign Fund</span>
          <p className="mt-2 text-2xl font-black text-neutral-900">{formatPaise(campaign.campaignFund)}</p>
          <p className="mt-1 text-[11px] text-neutral-500">Deposited escrow</p>
        </article>

        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase text-neutral-400">Platform Fee ({campaign.platformFeePercentage}%)</span>
          <p className="mt-2 text-2xl font-black text-navy">{formatPaise(campaign.platformFee)}</p>
          <p className="mt-1 text-[11px] text-neutral-500">Retained by marketplace</p>
        </article>

        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase text-neutral-400">Editor Pool</span>
          <p className="mt-2 text-2xl font-black text-emerald-600">{formatPaise(campaign.editorRewardPool)}</p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Remaining: <strong>{formatPaise(campaign.editorRewardPoolRemaining)}</strong>
          </p>
        </article>

        <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase text-neutral-400">Disbursed (Net)</span>
          <p className="mt-2 text-2xl font-black text-blue-600">{formatPaise(campaign.totalPaidNet || 0)}</p>
          <p className="mt-1 text-[11px] text-neutral-500">Paid to editors</p>
        </article>
      </section>

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Brief and Content Specs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Brief & Requirements */}
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-black text-lg text-neutral-900">Campaign Brief & Guidelines</h2>
            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
              {campaign.description || "No description provided."}
            </p>

            {campaign.contentRequirements && (
              <div className="mt-4 pt-4 border-t border-black/5">
                <h3 className="font-bold text-xs uppercase text-neutral-500 mb-2">Content Requirements</h3>
                <div className="rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800 whitespace-pre-line leading-relaxed font-mono">
                  {campaign.contentRequirements}
                </div>
              </div>
            )}

            {/* Social Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-black/5 text-xs">
              <div>
                <span className="font-bold text-neutral-400 block uppercase">Required Hashtags</span>
                <span className="font-semibold text-neutral-800">{campaign.hashtagRequirements || "None"}</span>
              </div>
              <div>
                <span className="font-bold text-neutral-400 block uppercase">Required Mentions</span>
                <span className="font-semibold text-neutral-800">{campaign.mentionRequirements || "None"}</span>
              </div>
            </div>

            {campaign.videoUrl && (
              <div className="pt-3 border-t border-black/5">
                <span className="font-bold text-neutral-400 block uppercase text-xs mb-1">Source Video / Assets</span>
                <a
                  href={campaign.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:underline"
                >
                  <Video size={14} /> Open Reference Asset <ExternalLink size={12} />
                </a>
              </div>
            )}
          </section>

          {/* Submissions & Rewards Audit */}
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-black text-lg text-neutral-900 mb-3">Disbursed Rewards & Verified Posts</h2>
            {campaign.rewards && campaign.rewards.length > 0 ? (
              <div className="divide-y divide-neutral-100 text-xs">
                {campaign.rewards.map((r, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-800">{r.verifiedViews.toLocaleString()} Verified Views</p>
                      <p className="text-[11px] text-neutral-400">Gross: {formatPaise(r.grossAmount)} · Fee: {formatPaise(r.platformFee)}</p>
                    </div>
                    <span className="font-black text-emerald-600 text-sm">
                      +{formatPaise(r.netAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No rewards have been approved or disbursed yet.</p>
            )}
          </section>
        </div>

        {/* Right Col: Creator Details & Slots */}
        <div className="space-y-6">
          {/* Creator Profile Card */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-neutral-900">Campaign Creator (Brand)</h3>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white font-bold text-sm">
                {campaign.creator?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-neutral-900 truncate">{campaign.creator?.name}</p>
                <p className="text-xs text-neutral-400">@{campaign.creator?.username}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Creator ID</span>
                <span className="font-mono text-neutral-700">{campaign.creatorId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Deadline</span>
                <span className="font-semibold text-neutral-800">{formatDate(campaign.deadline)}</span>
              </div>
            </div>
          </section>

          {/* Slots & Rules */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Slot Allocation & Rules</h3>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Total Editor Slots</span>
              <span className="font-bold text-neutral-900">{campaign.editorSlots} slots</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Approved Editors</span>
              <span className="font-bold text-neutral-900">{campaign.approvedEditorsCount}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Remaining Slots</span>
              <span className="font-bold text-neutral-900">{campaign.remainingSlots}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Max Earning / Editor</span>
              <span className="font-bold text-neutral-900">{formatPaise(campaign.maximumEditorEarning)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Rate / 1k Views</span>
              <span className="font-bold text-neutral-900">{formatPaise(campaign.earningPer1000Views)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
