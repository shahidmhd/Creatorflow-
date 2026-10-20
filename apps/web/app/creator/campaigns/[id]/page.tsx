"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  Pause,
  Play,
  Check,
  X,
  Trash2,
  Edit3,
  FileText,
  Users,
  Video,
  Sparkles,
  Share2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface CreatorCampaign {
  id: string;
  title: string;
  status: string;
  socialPlatform: string;
  category: string;
  campaignFund?: number;
  campaignFundRemaining?: number;
  rewardAmount: number;
  platformFee?: number;
  editorRewardPool?: number;
  editorRewardPoolRemaining?: number;
  totalPaidNet?: number;
  totalDisbursedGross?: number;
  editorSlots?: number;
  approvedEditorsCount?: number;
  remainingSlots?: number;
  maximumEditorEarning?: number;
  earningPer1000Views?: number;
  minimumViews?: number;
  minimumEngagement?: number;
  deadline: string;
  description: string;
  thumbnail?: string;
  videoUrl?: string;
  contentRequirements?: string;
  captionRequirements?: string;
  hashtagRequirements?: string;
  mentionRequirements?: string;
  additionalInstructions?: string;
}

interface ApplicationItem {
  id: string;
  editorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  message?: string;
  createdAt?: string;
  editor: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
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
  submittedAt?: string;
  editor: {
    name: string;
    username: string;
  };
}

interface PublishedPostItem {
  id: string;
  postUrl: string;
  platform: string;
  verifiedViews?: number;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  editor: {
    name: string;
    username: string;
  };
  reward?: {
    id: string;
    status: "PENDING" | "APPROVED" | "CREDITED" | "CANCELLED";
    verifiedViews?: number;
    calculatedAmount?: number;
    grossAmount: number;
    platformFee: number;
    netAmount: number;
  };
}

const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Tech",
  "Gaming",
  "Food",
  "Travel",
  "Fitness",
  "Education",
  "Entertainment",
  "Other",
];

export default function CreatorCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [tab, setTab] = useState<"applications" | "submissions" | "posts" | "brief">("applications");
  const [loading, setLoading] = useState(true);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [campaign, setCampaign] = useState<CreatorCampaign | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [posts, setPosts] = useState<PublishedPostItem[]>([]);

  // Edit Campaign Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "Tech",
    socialPlatform: "Instagram",
    videoUrl: "",
    deadline: "",
    minimumViews: 0,
    contentRequirements: "",
    hashtagRequirements: "",
    mentionRequirements: "",
    additionalInstructions: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, appsRes, subsRes, postsRes] = await Promise.all([
        api<CreatorCampaign>(`/campaigns/${campaignId}`),
        api<ApplicationItem[]>(`/applications/campaign/${campaignId}`).catch(() => []),
        api<SubmissionItem[]>(`/submissions/campaign/${campaignId}`).catch(() => []),
        api<PublishedPostItem[]>(`/published-posts/campaign/${campaignId}`).catch(() => []),
      ]);
      setCampaign(campRes);
      setApplications(appsRes || []);
      setSubmissions(subsRes || []);
      setPosts(postsRes || []);

      if (campRes) {
        // Pre-fill edit form
        const d = new Date(campRes.deadline);
        const pad = (n: number) => String(n).padStart(2, "0");
        const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setEditForm({
          title: campRes.title || "",
          description: campRes.description || "",
          category: campRes.category || "Tech",
          socialPlatform: campRes.socialPlatform || "Instagram",
          videoUrl: campRes.videoUrl || "",
          deadline: formattedDate,
          minimumViews: campRes.minimumViews || 0,
          contentRequirements: campRes.contentRequirements || "",
          hashtagRequirements: campRes.hashtagRequirements || "",
          mentionRequirements: campRes.mentionRequirements || "",
          additionalInstructions: campRes.additionalInstructions || "",
        });
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchData();
    }
  }, [campaignId, fetchData]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 5000);
  };

  /* ══════════════════════════════════════════════════
     CAMPAIGN CRUD & LIFECYCLE HANDLERS
  ══════════════════════════════════════════════════ */
  const handlePauseCampaign = async () => {
    if (busyActionId) return;
    setBusyActionId("pause");
    setErrorMessage("");
    try {
      const res = await api<CreatorCampaign>(`/campaigns/${campaignId}/pause`, { method: "POST" });
      setCampaign((prev) => (prev ? { ...prev, status: res.status } : res));
      showNotice("Campaign paused. Editors cannot submit new clips until resumed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to pause campaign");
    } finally {
      setBusyActionId(null);
    }
  };

  const handlePublishCampaign = async () => {
    if (busyActionId) return;
    setBusyActionId("publish");
    setErrorMessage("");
    try {
      const res = await api<CreatorCampaign>(`/campaigns/${campaignId}/publish`, { method: "POST" });
      setCampaign((prev) => (prev ? { ...prev, status: res.status } : res));
      showNotice("Campaign is now published and active!");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to publish campaign");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleCompleteCampaign = async () => {
    if (busyActionId) return;
    if (
      !confirm(
        "Are you sure you want to mark this campaign as COMPLETED? It will stop accepting submissions."
      )
    ) {
      return;
    }
    setBusyActionId("complete");
    setErrorMessage("");
    try {
      const res = await api<CreatorCampaign>(`/campaigns/${campaignId}/complete`, { method: "POST" });
      setCampaign((prev) => (prev ? { ...prev, status: res.status } : res));
      showNotice("Campaign marked as completed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to complete campaign");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleCancelCampaign = async () => {
    if (busyActionId) return;
    if (
      !confirm(
        "Are you sure you want to CANCEL this campaign? Any remaining unspent escrow fund will be automatically refunded into your wallet."
      )
    ) {
      return;
    }
    setBusyActionId("cancel");
    setErrorMessage("");
    try {
      const res = await api<CreatorCampaign>(`/campaigns/${campaignId}/cancel`, { method: "POST" });
      setCampaign((prev) => (prev ? { ...prev, status: res.status } : res));
      showNotice("Campaign cancelled. Unspent escrow funds have been refunded to your wallet.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to cancel campaign");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (busyActionId) return;
    if (
      !confirm(
        "Are you sure you want to permanently DELETE this campaign? This action cannot be undone."
      )
    ) {
      return;
    }
    setBusyActionId("delete");
    setErrorMessage("");
    try {
      await api(`/campaigns/${campaignId}`, { method: "DELETE" });
      router.push("/creator/campaigns");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete campaign");
      setBusyActionId(null);
    }
  };

  const handleSaveCampaignEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMessage("");
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        socialPlatform: editForm.socialPlatform,
        videoUrl: editForm.videoUrl.trim() || undefined,
        deadline: new Date(editForm.deadline).toISOString(),
        minimumViews: Number(editForm.minimumViews) || 0,
        contentRequirements: editForm.contentRequirements.trim() || undefined,
        hashtagRequirements: editForm.hashtagRequirements.trim() || undefined,
        mentionRequirements: editForm.mentionRequirements.trim() || undefined,
        additionalInstructions: editForm.additionalInstructions.trim() || undefined,
      };

      const updated = await api<CreatorCampaign>(`/campaigns/${campaignId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setCampaign((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditModalOpen(false);
      showNotice("Campaign details updated successfully.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update campaign details");
    } finally {
      setUpdating(false);
    }
  };

  /* ══════════════════════════════════════════════════
     APPLICATION & SUBMISSION HANDLERS
  ══════════════════════════════════════════════════ */
  const handleApproveApp = async (appId: string) => {
    if (busyActionId) return;
    setBusyActionId(appId);
    try {
      await api(`/applications/${appId}/approve`, { method: "POST" });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "APPROVED" } : a))
      );
      showNotice("Application approved. The editor can now submit content.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to approve application");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleRejectApp = async (appId: string) => {
    if (busyActionId) return;
    setBusyActionId(appId);
    try {
      await api(`/applications/${appId}/reject`, { method: "POST" });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a))
      );
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to reject application");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleApproveSub = async (subId: string) => {
    if (busyActionId) return;
    setBusyActionId(subId);
    try {
      await api(`/submissions/${subId}/approve`, { method: "POST" });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: "APPROVED" } : s))
      );
      showNotice("Content approved. Editor has been notified to publish the post.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to approve submission");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleRequestChanges = async (subId: string) => {
    if (busyActionId) return;
    const reason = prompt("Enter requested changes for the editor:");
    if (!reason) return;

    setBusyActionId(subId);
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
      showNotice("Feedback sent to editor.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleVerifyPost = async (postId: string) => {
    if (busyActionId) return;
    const viewsInput = prompt("Enter verified views count for this post (e.g. 10000):", "1000");
    if (viewsInput === null) return;
    const views = parseInt(viewsInput, 10);
    if (isNaN(views) || views < 0) {
      alert("Please enter a valid non-negative number of views.");
      return;
    }

    setBusyActionId(postId);
    try {
      await api(`/published-posts/${postId}/verify`, {
        method: "POST",
        body: JSON.stringify({ verifiedViews: views }),
      });
      showNotice("Post verified! Reward has been generated with view-based calculation.");
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to verify post");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleUpdateViews = async (rewardId: string, currentViews: number = 0) => {
    if (busyActionId) return;
    const viewsInput = prompt("Update verified views for this post:", currentViews.toString());
    if (viewsInput === null) return;
    const views = parseInt(viewsInput, 10);
    if (isNaN(views) || views < 0) {
      alert("Please enter a valid non-negative number of views.");
      return;
    }

    setBusyActionId(rewardId);
    try {
      await api(`/rewards/${rewardId}/update-views`, {
        method: "POST",
        body: JSON.stringify({ verifiedViews: views }),
      });
      showNotice("Verified views updated! Calculation re-synced.");
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update views");
    } finally {
      setBusyActionId(null);
    }
  };

  const handleReleaseReward = async (rewardId: string, postId: string) => {
    if (busyActionId) return;
    setBusyActionId(rewardId);
    try {
      await api(`/rewards/${rewardId}/approve`, { method: "POST" });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId && p.reward ? { ...p, reward: { ...p.reward, status: "APPROVED" } } : p
        )
      );
      showNotice("Reward approved! Editor wallet credited and platform fee recorded.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to release reward");
    } finally {
      setBusyActionId(null);
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
        <Link
          href="/creator/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy"
        >
          <ArrowLeft size={14} /> Back to campaigns
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage || "Campaign not found"}
        </div>
      </div>
    );
  }

  const campaignFundTotal = (campaign.campaignFund ?? campaign.rewardAmount) / 100;
  const editorPoolTotal = (campaign.editorRewardPool ?? Math.floor(campaignFundTotal * 85)) / 100;

  const paidNetMajor = campaign.totalPaidNet !== undefined
    ? Math.round(campaign.totalPaidNet / 100)
    : Math.round(
        posts
          .filter((p) => p.reward?.status === "CREDITED")
          .reduce((sum, p) => sum + (p.reward?.netAmount || 0), 0) / 100
      );

  const disbursedGrossMajor = campaign.totalDisbursedGross !== undefined
    ? Math.round(campaign.totalDisbursedGross / 100)
    : Math.round(
        posts
          .filter((p) => p.reward?.status === "CREDITED")
          .reduce((sum, p) => sum + (p.reward?.grossAmount || 0), 0) / 100
      );

  const remainingEditorPool = campaign.editorRewardPoolRemaining !== undefined
    ? Math.round(campaign.editorRewardPoolRemaining / 100)
    : Math.max(0, editorPoolTotal - paidNetMajor);

  const remainingFund = campaign.campaignFundRemaining !== undefined
    ? Math.round(campaign.campaignFundRemaining / 100)
    : Math.max(0, campaignFundTotal - disbursedGrossMajor);

  const maxPerEditor =
    (campaign.maximumEditorEarning ??
      (campaign.editorSlots ? Math.floor(editorPoolTotal / campaign.editorSlots) : editorPoolTotal)) / 100;
  const earningRate = ((campaign.earningPer1000Views ?? 0) / 100).toFixed(2);

  const isDraft = campaign.status === "DRAFT";
  const isPublished = campaign.status === "PUBLISHED";
  const isPaused = campaign.status === "PAUSED";
  const isCompleted = campaign.status === "COMPLETED";
  const isCancelled = campaign.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/creator/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy"
        >
          <ArrowLeft size={14} /> Back to campaigns
        </Link>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs font-bold text-neutral-500 hover:text-navy inline-flex items-center gap-1"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN CAMPAIGN HEADER & CRUD ACTION BAR
      ══════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-neutral-900 truncate">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-neutral-600">{campaign.socialPlatform}</span>
              <span>•</span>
              <span>{campaign.category}</span>
              <span>•</span>
              <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Edit Button (Available if not completed/cancelled) */}
            {!isCompleted && !isCancelled && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-navy-soft transition"
              >
                <Edit3 size={13} /> Edit Campaign
              </button>
            )}

            {/* If DRAFT -> Publish, Delete */}
            {isDraft && (
              <>
                <button
                  onClick={handlePublishCampaign}
                  disabled={busyActionId === "publish"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Play size={13} /> Publish Now
                </button>
                <button
                  onClick={handleDeleteCampaign}
                  disabled={busyActionId === "delete"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </>
            )}

            {/* If PUBLISHED -> Pause, Complete, Cancel */}
            {isPublished && (
              <>
                <button
                  onClick={handlePauseCampaign}
                  disabled={busyActionId === "pause"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                >
                  <Pause size={13} /> Pause
                </button>
                <button
                  onClick={handleCompleteCampaign}
                  disabled={busyActionId === "complete"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Complete
                </button>
                <button
                  onClick={handleCancelCampaign}
                  disabled={busyActionId === "cancel"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  title="Cancel campaign and refund unspent escrow"
                >
                  <X size={13} /> Cancel
                </button>
              </>
            )}

            {/* If PAUSED -> Resume (Publish), Complete, Cancel */}
            {isPaused && (
              <>
                <button
                  onClick={handlePublishCampaign}
                  disabled={busyActionId === "publish"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Play size={13} /> Resume Campaign
                </button>
                <button
                  onClick={handleCompleteCampaign}
                  disabled={busyActionId === "complete"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Complete
                </button>
                <button
                  onClick={handleCancelCampaign}
                  disabled={busyActionId === "cancel"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  <X size={13} /> Cancel
                </button>
              </>
            )}

            {/* If CANCELLED -> Delete */}
            {isCancelled && (
              <button
                onClick={handleDeleteCampaign}
                disabled={busyActionId === "delete"}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
              >
                <Trash2 size={13} /> Delete Record
              </button>
            )}
          </div>
        </div>

        {/* Financial & Slot Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Escrow Remaining (100%)
            </span>
            <span className="text-sm font-black text-navy">
              ₹{remainingFund.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-neutral-400 block font-medium mt-0.5">
              ₹{disbursedGrossMajor.toLocaleString("en-IN")} disbursed of ₹{campaignFundTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Editor Pool Remaining (85%)
            </span>
            <span className="text-sm font-black text-emerald-600">
              ₹{remainingEditorPool.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-700 block font-medium mt-0.5">
              ₹{paidNetMajor.toLocaleString("en-IN")} paid of ₹{editorPoolTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Slots (Approved / Max)
            </span>
            <span className="text-sm font-black text-neutral-800">
              {campaign.approvedEditorsCount ?? 0} / {campaign.editorSlots ?? "—"}{" "}
              <span className="text-xs font-semibold text-neutral-400">
                ({campaign.remainingSlots ?? 0} left)
              </span>
            </span>
            <span className="text-[10px] text-neutral-400 block font-medium mt-0.5">
              Cap: ₹{maxPerEditor.toLocaleString("en-IN")} / editor
            </span>
          </div>

          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              View Reward Rate
            </span>
            <span className="text-sm font-black text-neutral-800">₹{earningRate} / 1k</span>
            <span className="text-[10px] text-neutral-400 block font-medium mt-0.5">
              Verified view based
            </span>
          </div>
        </div>

        {/* Notices & Alerts */}
        {actionNotice && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={16} /> {actionNotice}
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-navy/5 pt-4">
          <button
            onClick={() => setTab("applications")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "applications"
                ? "bg-navy text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setTab("submissions")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "submissions"
                ? "bg-navy text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setTab("posts")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "posts"
                ? "bg-navy text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Live Posts ({posts.length})
          </button>
          <button
            onClick={() => setTab("brief")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "brief"
                ? "bg-navy text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Brief & Guidelines
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TAB 1: APPLICATIONS
      ══════════════════════════════════════════════════ */}
      {tab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-sm">
              <Users size={28} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-bold text-neutral-700">No applications received yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Editors who discover your campaign in the explore feed will apply here.
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{app.editor.name}</span>
                    <span className="text-xs text-neutral-400">@{app.editor.username}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.message && (
                    <p className="text-xs text-neutral-600 mt-1 italic">&ldquo;{app.message}&rdquo;</p>
                  )}
                  {app.createdAt && (
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {app.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveApp(app.id)}
                      disabled={busyActionId === app.id}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectApp(app.id)}
                      disabled={busyActionId === app.id}
                      className="rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2: CONTENT SUBMISSIONS
      ══════════════════════════════════════════════════ */}
      {tab === "submissions" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-sm">
              <Video size={28} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-bold text-neutral-700">No submissions uploaded yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Approved editors will submit their edited short-form clips here for your review.
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{sub.editor.name}</span>
                    <span className="text-xs text-neutral-400">@{sub.editor.username}</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  {sub.caption && (
                    <p className="text-xs text-neutral-600 mt-1 italic">&ldquo;{sub.caption}&rdquo;</p>
                  )}
                  {sub.notes && (
                    <p className="text-xs text-neutral-500 mt-0.5">Notes: {sub.notes}</p>
                  )}
                  {sub.feedback && (
                    <p className="text-xs text-amber-700 mt-0.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      Feedback: {sub.feedback}
                    </p>
                  )}
                  <a
                    href={sub.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-navy hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    Open submitted clip <ExternalLink size={11} />
                  </a>
                </div>

                {sub.status === "SUBMITTED" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveSub(sub.id)}
                      disabled={busyActionId === sub.id}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestChanges(sub.id)}
                      disabled={busyActionId === sub.id}
                      className="rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-50 px-3 py-2 transition disabled:opacity-50"
                    >
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 3: PUBLISHED LIVE POSTS & REWARDS
      ══════════════════════════════════════════════════ */}
      {tab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-sm">
              <Share2 size={28} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-bold text-neutral-700">No published clips yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Once approved clips go live on Instagram / YouTube, editors submit the public links
                here for view verification.
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const netEditor = post.reward ? post.reward.netAmount / 100 : 0;
              const platformFee = post.reward ? post.reward.platformFee / 100 : 0;
              const isCredited = post.reward?.status === "CREDITED";

              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-neutral-900">{post.editor.name}</span>
                      <span className="text-xs text-neutral-400 ml-1">(@{post.editor.username})</span>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-navy hover:underline ml-3 inline-flex items-center gap-1"
                      >
                        Open Public Post <ExternalLink size={11} />
                      </a>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>

                  <div className="rounded-xl bg-surface/60 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700">Verified Views:</span>
                      <span className="font-bold text-navy">
                        {(post.verifiedViews ?? post.reward?.verifiedViews ?? 0).toLocaleString(
                          "en-IN"
                        )}{" "}
                        views
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>
                        Editor payout: ₹{netEditor.toLocaleString("en-IN")} (Cap: ₹
                        {maxPerEditor.toLocaleString("en-IN")})
                      </span>
                      <span>Platform fee (15%): ₹{platformFee.toLocaleString("en-IN")}</span>
                    </div>
                    {isCredited && (
                      <div className="pt-1 text-right">
                        <span className="font-black text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 size={14} /> Credited to Editor Wallet
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-navy/5 pt-3">
                    {post.status === "PENDING_VERIFICATION" && (
                      <button
                        onClick={() => handleVerifyPost(post.id)}
                        disabled={busyActionId === post.id}
                        className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white hover:bg-navy/90 disabled:opacity-50 transition"
                      >
                        {busyActionId === post.id ? "Verifying..." : "Verify Post & Views"}
                      </button>
                    )}
                    {post.status === "VERIFIED" && post.reward && !isCredited && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateViews(
                              post.reward!.id,
                              post.verifiedViews ?? post.reward?.verifiedViews ?? 0
                            )
                          }
                          disabled={busyActionId === post.reward.id}
                          className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft disabled:opacity-50"
                        >
                          Update Views
                        </button>
                        <button
                          onClick={() => handleReleaseReward(post.reward!.id, post.id)}
                          disabled={busyActionId === post.reward.id}
                          className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          {busyActionId === post.reward.id
                            ? "Processing..."
                            : `Approve & Release (₹${netEditor.toLocaleString("en-IN")})`}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 4: BRIEF & GUIDELINES
      ══════════════════════════════════════════════════ */}
      {tab === "brief" && (
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-neutral-900">Campaign Brief & Guidelines</h2>
            {!isCompleted && !isCancelled && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft transition"
              >
                <Edit3 size={13} /> Edit Brief
              </button>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Description / Overview
            </h3>
            <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
              {campaign.description || "No description provided."}
            </p>
          </div>

          {campaign.videoUrl && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Source Video Reference
              </h3>
              <a
                href={campaign.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-navy hover:underline inline-flex items-center gap-1"
              >
                {campaign.videoUrl} <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Creative Guidelines & Requirements
            </h3>
            <div className="rounded-xl border border-navy/10 bg-surface/40 p-4 text-xs text-neutral-800 font-mono whitespace-pre-wrap leading-relaxed">
              {campaign.contentRequirements || "Standard short-form viral guidelines apply."}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Required Hashtags
              </h3>
              <p className="text-xs font-bold text-navy">
                {campaign.hashtagRequirements || "None specified"}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Required Mentions
              </h3>
              <p className="text-xs font-bold text-navy">
                {campaign.mentionRequirements || "None specified"}
              </p>
            </div>
          </div>

          {campaign.additionalInstructions && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Additional Instructions
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                {campaign.additionalInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: EDIT CAMPAIGN DETAILS
      ══════════════════════════════════════════════════ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-navy/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-navy/10">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Edit Campaign Details</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Update guidelines, requirements, deadline, or video link.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCampaignEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2.5 text-xs font-bold text-neutral-900 outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-navy/15 bg-surface px-3 py-2.5 text-xs font-bold text-neutral-800 outline-none focus:border-navy"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Platform *
                  </label>
                  <select
                    value={editForm.socialPlatform}
                    onChange={(e) => setEditForm({ ...editForm, socialPlatform: e.target.value as "Instagram" | "YouTube" })}
                    className="w-full rounded-xl border border-navy/15 bg-surface px-3 py-2.5 text-xs font-bold text-neutral-800 outline-none focus:border-navy"
                  >
                    <option value="Instagram">Instagram Reels</option>
                    <option value="YouTube">YouTube Shorts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Source Video Reference URL
                </label>
                <input
                  type="url"
                  value={editForm.videoUrl}
                  onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2.5 text-xs font-medium text-neutral-900 outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Minimum Views to Qualify
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.minimumViews}
                    onChange={(e) => setEditForm({ ...editForm, minimumViews: Number(e.target.value) })}
                    className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-bold text-neutral-900 outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Campaign Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Creative Guidelines & Hook Requirements
                </label>
                <textarea
                  rows={4}
                  value={editForm.contentRequirements}
                  onChange={(e) => setEditForm({ ...editForm, contentRequirements: e.target.value })}
                  className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-mono text-neutral-900 outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Required Hashtags
                  </label>
                  <input
                    type="text"
                    value={editForm.hashtagRequirements}
                    onChange={(e) => setEditForm({ ...editForm, hashtagRequirements: e.target.value })}
                    placeholder="#brand #product"
                    className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Required Mentions
                  </label>
                  <input
                    type="text"
                    value={editForm.mentionRequirements}
                    onChange={(e) => setEditForm({ ...editForm, mentionRequirements: e.target.value })}
                    placeholder="@brandname"
                    className="w-full rounded-xl border border-navy/15 bg-surface px-4 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-navy px-6 py-2.5 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
