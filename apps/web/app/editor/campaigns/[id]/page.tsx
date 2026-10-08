"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Send, AlertCircle, Loader2, Users, Eye, Sparkles } from "lucide-react";
import { api, ApiError } from "@/app/api";
import { CampaignDummyThumbnail } from "@/app/components";

interface CampaignDetail {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  category: string;
  socialPlatform: string;
  campaignFund?: number;
  rewardAmount?: number;
  editorRewardPool?: number;
  editorSlots?: number;
  approvedEditorsCount?: number;
  remainingSlots?: number;
  maximumEditorEarning?: number;
  earningPer1000Views?: number;
  minimumViews?: number;
  currency: string;
  deadline: string;
  contentRequirements?: string;
  captionRequirements?: string;
  hashtagRequirements?: string;
  mentionRequirements?: string;
  status: string;
  creator?: {
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
}

interface ApplicationRecord {
  id: string;
  campaignId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  message?: string;
}

export default function EditorCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [existingApp, setExistingApp] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        // Load campaign
        const campaignData = await api<CampaignDetail>(`/campaigns/${campaignId}`);
        if (isMounted) setCampaign(campaignData);

        // Check if editor has already applied
        try {
          const myApps = await api<ApplicationRecord[]>("/applications/mine");
          const found = myApps.find((a) => a.campaignId === campaignId);
          if (isMounted && found) {
            setExistingApp(found);
          }
        } catch {
          // Ignore if unauthenticated
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load campaign details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (campaignId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || existingApp) return;

    setSubmitting(true);
    setErrorMessage("");
    setSuccessNotice("");

    try {
      const created = await api<ApplicationRecord>("/applications", {
        method: "POST",
        body: JSON.stringify({ campaignId, message }),
      });
      setExistingApp(created);
      setSuccessNotice("Application submitted successfully! The creator will review your pitch.");
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 409 || err.code === "APPLICATION_ALREADY_EXISTS")) {
        setErrorMessage("You have already applied to this campaign.");
        setExistingApp({
          id: "existing",
          campaignId,
          status: "PENDING",
        });
      } else {
        setErrorMessage(err instanceof Error ? err.message : "Failed to submit application");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <Link href="/editor/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy">
          <ArrowLeft size={14} /> Back to discover campaigns
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage || "Campaign not found"}
        </div>
      </div>
    );
  }

  const fundMajor = Math.round((campaign.campaignFund || campaign.rewardAmount || 100000) / 100);
  const totalSlots = campaign.editorSlots || 1;
  const approvedCount = campaign.approvedEditorsCount || 0;
  const remainingSlots = campaign.remainingSlots !== undefined ? campaign.remainingSlots : Math.max(0, totalSlots - approvedCount);

  const maxEarningMajor = Math.floor(
    (campaign.maximumEditorEarning || Math.floor((fundMajor * 100 * 0.85) / totalSlots)) / 100
  );

  const rateVal = campaign.earningPer1000Views
    ? (campaign.earningPer1000Views / 100).toFixed(2)
    : "8.50";

  const isAccepting = campaign.status === "PUBLISHED";
  const slotsFull = remainingSlots === 0;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/editor/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy">
        <ArrowLeft size={14} /> Back to discover campaigns
      </Link>

      <div className="rounded-2xl border border-navy/10 bg-white overflow-hidden shadow-sm space-y-6">
        {/* Top 16:9 Banner or Dummy Image */}
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-neutral-900">
          {campaign.thumbnail && !imgError ? (
            <img
              src={campaign.thumbnail}
              alt={campaign.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <CampaignDummyThumbnail
              title={campaign.title}
              category={campaign.category}
              platform={campaign.socialPlatform}
            />
          )}

          <div className="absolute right-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur shadow-sm">
            {campaign.socialPlatform === "YouTube" ? "▶ YouTube" : "📸 Instagram"}
          </div>
        </div>

        <div className="p-6 pt-0 space-y-6">
          {/* Header & Earning Hero */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-navy/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {campaign.category} • {campaign.socialPlatform}
                </span>
              </div>
              <h1 className="text-2xl font-black text-neutral-900 mt-1">{campaign.title}</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                By {campaign.creator?.name ?? "Creator"} (@{campaign.creator?.username ?? "creator"})
              </p>
            </div>

            {/* Editor Earning Card */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-right min-w-48 shadow-xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Max Editor Earning
              </span>
              <span className="text-2xl font-black text-emerald-700">
                ₹{maxEarningMajor.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                ₹{rateVal} per 1,000 verified views
              </span>
            </div>
          </div>

          {/* Slot & View Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-surface p-4 text-xs font-medium">
            <div>
              <span className="block text-[10px] font-bold uppercase text-neutral-400">Total Campaign Fund</span>
              <span className="text-sm font-black text-neutral-900">₹{fundMajor.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-neutral-400">Editor Slots</span>
              <span className="text-sm font-black text-neutral-900">{totalSlots} Slots</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-neutral-400">Remaining Slots</span>
              <span className={`text-sm font-black ${slotsFull ? "text-red-600" : "text-emerald-600"}`}>
                {remainingSlots} available
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-neutral-400">Minimum Views</span>
              <span className="text-sm font-black text-neutral-900">
                {campaign.minimumViews ? campaign.minimumViews.toLocaleString() : "0"}
              </span>
            </div>
          </div>

          {/* Campaign Brief */}
          <div>
            <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-2">Campaign Brief</h2>
            <p className="text-sm leading-6 text-neutral-600">{campaign.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-surface p-4 text-xs leading-5">
            <div>
              <span className="font-bold text-neutral-700 block">Content Requirements:</span>
              <span className="text-neutral-500">{campaign.contentRequirements || "Standard campaign guidelines apply."}</span>
            </div>
            <div>
              <span className="font-bold text-neutral-700 block">Hashtags & Mentions:</span>
              <span className="text-neutral-500">
                {campaign.hashtagRequirements || "None required"} • {campaign.mentionRequirements || "None required"}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={16} /> {successNotice}
            </div>
          )}

          {/* Application Form or Status */}
          <div className="border-t border-navy/10 pt-5">
            {!isAccepting ? (
              <div className="rounded-2xl bg-amber-50 p-5 text-center space-y-2 border border-amber-200">
                <Clock size={24} className="mx-auto text-amber-600" />
                <h3 className="text-base font-black text-amber-900">Campaign Not Accepting Applications</h3>
                <p className="text-xs text-amber-700 max-w-md mx-auto">
                  This campaign status is {campaign.status}. Only published, active campaigns can accept editor applications.
                </p>
              </div>
            ) : existingApp ? (
              <div className="rounded-2xl bg-emerald-50 p-5 text-center space-y-2 border border-emerald-200">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                <h3 className="text-base font-black text-emerald-900">
                  Application {existingApp.status === "PENDING" ? "Submitted" : existingApp.status}!
                </h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  {existingApp.status === "PENDING" &&
                    "The creator is reviewing your pitch. Once approved, you can create and submit your content directly."}
                  {existingApp.status === "APPROVED" &&
                    "Your application has been approved! Head over to your submissions to start working on your content."}
                  {existingApp.status === "REJECTED" &&
                    "Your application was not selected for this campaign."}
                  {existingApp.status === "WITHDRAWN" &&
                    "You withdrew your application from this campaign."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/editor/submissions"
                    className="inline-block rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    View My Submissions
                  </Link>
                </div>
              </div>
            ) : slotsFull ? (
              <div className="rounded-2xl bg-neutral-100 p-5 text-center space-y-2 border border-neutral-200">
                <Users size={24} className="mx-auto text-neutral-400" />
                <h3 className="text-base font-black text-neutral-700">Editor Slots Filled</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  All {totalSlots} approved editor slots for this campaign have been taken. Check out other open campaigns on the marketplace.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-neutral-900">Apply for an Editor Slot</h2>
                  <span className="text-xs font-bold text-emerald-600">{remainingSlots} of {totalSlots} slots remaining</span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Your Pitch / Experience</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    disabled={submitting}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the creator why you're a great fit (relevant edits, turnaround speed, style)..."
                    className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Apply for Slot
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
