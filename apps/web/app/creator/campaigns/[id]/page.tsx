"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Clock, ExternalLink, RefreshCw, X, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface CreatorCampaign {
  id: string;
  title: string;
  status: string;
  socialPlatform: string;
  category: string;
  campaignFund?: number;
  rewardAmount: number;
  editorRewardPool?: number;
  editorSlots?: number;
  approvedEditorsCount?: number;
  remainingSlots?: number;
  maximumEditorEarning?: number;
  earningPer1000Views?: number;
  minimumViews?: number;
  deadline: string;
  description: string;
}

interface ApplicationItem {
  id: string;
  editorId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  message?: string;
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

export default function CreatorCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [tab, setTab] = useState<"applications" | "submissions" | "posts">("applications");
  const [loading, setLoading] = useState(true);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [campaign, setCampaign] = useState<CreatorCampaign | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [posts, setPosts] = useState<PublishedPostItem[]>([]);

  const fetchData = async () => {
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchData();
    }
  }, [campaignId]);

  const handleApproveApp = async (appId: string) => {
    if (busyActionId) return;
    setBusyActionId(appId);
    try {
      await api(`/applications/${appId}/approve`, { method: "POST" });
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "APPROVED" } : a)));
      setActionNotice("Application approved. The editor can now submit content.");
      setTimeout(() => setActionNotice(""), 4000);
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
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "REJECTED" } : a)));
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
      setSubmissions((prev) => prev.map((s) => (s.id === subId ? { ...s, status: "APPROVED" } : s)));
      setActionNotice("Content approved. Editor has been notified to publish the post.");
      setTimeout(() => setActionNotice(""), 4000);
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
        prev.map((s) => (s.id === subId ? { ...s, status: "CHANGES_REQUESTED", feedback: reason } : s))
      );
      setActionNotice("Feedback sent to editor.");
      setTimeout(() => setActionNotice(""), 4000);
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
      setActionNotice("Post verified! Reward has been generated with view-based calculation.");
      await fetchData(); // Refresh posts to pick up auto-created reward
      setTimeout(() => setActionNotice(""), 4000);
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
      await api(`/rewards/${rewardId}/views`, {
        method: "POST",
        body: JSON.stringify({ verifiedViews: views }),
      });
      setActionNotice("Verified views and reward calculation updated.");
      await fetchData();
      setTimeout(() => setActionNotice(""), 4000);
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
      setActionNotice("Reward approved! Editor wallet has been credited and platform fee recorded.");
      setTimeout(() => setActionNotice(""), 6000);
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
        <Link href="/creator/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy">
          <ArrowLeft size={14} /> Back to campaigns
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage || "Campaign not found"}
        </div>
      </div>
    );
  }

  const campaignFund = (campaign.campaignFund ?? campaign.rewardAmount) / 100;
  const editorPool = (campaign.editorRewardPool ?? Math.floor(campaignFund * 85)) / 100;
  const maxPerEditor = (campaign.maximumEditorEarning ?? (campaign.editorSlots ? Math.floor(editorPool / campaign.editorSlots) : editorPool)) / 100;
  const earningRate = ((campaign.earningPer1000Views ?? 0) / 100).toFixed(2);

  return (
    <div className="space-y-6">
      <Link href="/creator/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy">
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-neutral-900">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {campaign.socialPlatform} • {campaign.category} • Deadline: {new Date(campaign.deadline).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-xl bg-navy-soft/60 px-4 py-2.5 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Campaign Fund</span>
            <span className="text-lg font-black text-navy">₹{campaignFund.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Financial and Slot Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Editor Pool (85%)</span>
            <span className="text-sm font-black text-navy">₹{editorPool.toLocaleString("en-IN")}</span>
          </div>
          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Slots (Approved / Max)</span>
            <span className="text-sm font-black text-navy">
              {campaign.approvedEditorsCount ?? 0} / {campaign.editorSlots ?? "—"} ({campaign.remainingSlots ?? 0} left)
            </span>
          </div>
          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Max Per Editor</span>
            <span className="text-sm font-black text-navy">₹{maxPerEditor.toLocaleString("en-IN")}</span>
          </div>
          <div className="rounded-xl border border-navy/10 bg-surface/50 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">View Rate</span>
            <span className="text-sm font-black text-navy">₹{earningRate} / 1k views</span>
          </div>
        </div>

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

        {/* Tab Navigation */}
        <div className="flex border-b border-navy/10 pt-2 gap-4 text-xs font-bold text-neutral-500">
          {[
            { id: "applications", label: `Applications (${applications.length})` },
            { id: "submissions", label: `Content Submissions (${submissions.length})` },
            { id: "posts", label: `Published Posts (${posts.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as never);
                setErrorMessage("");
              }}
              className={`pb-3 transition ${tab === t.id ? "border-b-2 border-navy text-navy font-black" : "hover:text-neutral-900"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {tab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-xs text-neutral-500">
              No applications yet. Editors can apply from the discovery marketplace.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{app.editor?.name || "Editor"}</span>
                    <span className="text-xs text-neutral-400">@{app.editor?.username || "editor"}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.message && <p className="mt-1 text-xs text-neutral-600">&ldquo;{app.message}&rdquo;</p>}
                </div>

                {app.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectApp(app.id)}
                      disabled={busyActionId === app.id}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyActionId === app.id ? "..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleApproveApp(app.id)}
                      disabled={busyActionId === app.id}
                      className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white shadow-navy hover:opacity-90 disabled:opacity-50"
                    >
                      {busyActionId === app.id ? "Approving..." : "Approve"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SUBMISSIONS */}
      {tab === "submissions" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-xs text-neutral-500">
              No content submissions uploaded yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-neutral-900">{sub.editor?.name || "Editor"}</span>
                    {sub.caption && <p className="text-xs text-neutral-400">Caption: &ldquo;{sub.caption}&rdquo;</p>}
                    {sub.notes && <p className="text-xs text-neutral-400">Notes: &ldquo;{sub.notes}&rdquo;</p>}
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={sub.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft"
                  >
                    <ExternalLink size={13} /> View Content Asset
                  </a>
                </div>

                {sub.feedback && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl font-semibold border border-amber-200">
                    Change Request: {sub.feedback}
                  </p>
                )}

                {sub.status === "SUBMITTED" && (
                  <div className="flex items-center justify-end gap-2 border-t border-navy/5 pt-3">
                    <button
                      onClick={() => handleRequestChanges(sub.id)}
                      disabled={busyActionId === sub.id}
                      className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleApproveSub(sub.id)}
                      disabled={busyActionId === sub.id}
                      className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white shadow-navy hover:opacity-90 disabled:opacity-50"
                    >
                      {busyActionId === sub.id ? "Approving..." : "Approve Content"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PUBLISHED POSTS & REWARDS */}
      {tab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-xs text-neutral-500">
              No published post URLs submitted yet.
            </div>
          ) : (
            posts.map((post) => {
              const grossReward = (post.reward?.grossAmount ?? campaign.rewardAmount) / 100;
              const netEditor = (post.reward?.netAmount ?? Math.floor(grossReward * 85)) / 100;
              const platformFee = (post.reward?.platformFee ?? Math.floor(grossReward * 15)) / 100;
              const isCredited = post.reward?.status === "APPROVED" || post.reward?.status === "CREDITED";

              return (
                <div key={post.id} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-neutral-900">{post.editor?.name || "Editor"}</span>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs font-semibold text-navy hover:underline mt-0.5"
                      >
                        {post.postUrl} <ExternalLink size={11} className="inline" />
                      </a>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>

                  <div className="rounded-xl bg-navy-soft/60 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700">Verified Views & Reward:</span>
                      <span className="font-bold text-navy">
                        {(post.verifiedViews ?? post.reward?.verifiedViews ?? 0).toLocaleString("en-IN")} views
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>Editor receives: ₹{netEditor.toLocaleString("en-IN")} (Max: ₹{maxPerEditor.toLocaleString("en-IN")})</span>
                      <span>Platform fee (15%): ₹{platformFee.toLocaleString("en-IN")}</span>
                    </div>
                    {isCredited ? (
                      <div className="pt-1 text-right">
                        <span className="font-black text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 size={14} /> Credited to Editor Wallet
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-navy/5 pt-3">
                    {post.status === "PENDING_VERIFICATION" && (
                      <button
                        onClick={() => handleVerifyPost(post.id)}
                        disabled={busyActionId === post.id}
                        className="rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white shadow-navy disabled:opacity-50"
                      >
                        {busyActionId === post.id ? "Verifying..." : "Verify Post & Views"}
                      </button>
                    )}
                    {post.status === "VERIFIED" && post.reward && !isCredited && (
                      <>
                        <button
                          onClick={() => handleUpdateViews(post.reward!.id, post.verifiedViews ?? post.reward?.verifiedViews ?? 0)}
                          disabled={busyActionId === post.reward.id}
                          className="rounded-full border border-navy/20 px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy-soft disabled:opacity-50"
                        >
                          Update Views
                        </button>
                        <button
                          onClick={() => handleReleaseReward(post.reward!.id, post.id)}
                          disabled={busyActionId === post.reward.id}
                          className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busyActionId === post.reward.id
                            ? "Processing..."
                            : `Approve & Release Reward (₹${netEditor.toLocaleString("en-IN")})`}
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
    </div>
  );
}
