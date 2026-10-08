"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Link as LinkIcon, Send, Sparkles, Loader2, AlertCircle, PlusCircle, RefreshCw } from "lucide-react";
import { api, ApiError } from "@/app/api";
import { StatusBadge } from "@/app/components";

interface MySubmission {
  id: string;
  campaignId: string;
  contentUrl: string;
  caption?: string;
  notes?: string;
  feedback?: string;
  status: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";
  campaign: {
    id: string;
    title: string;
    rewardAmount: number;
    currency: string;
    creator?: {
      name: string;
    };
  };
  publishedPost?: {
    id: string;
    postUrl: string;
    status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  };
}

interface MyApplication {
  id: string;
  campaignId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  campaign: {
    id: string;
    title: string;
    status: string;
    rewardAmount: number;
    currency: string;
  };
}

export default function EditorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // New submission / resubmission state
  const [activeModalCampaignId, setActiveModalCampaignId] = useState<string | null>(null);
  const [contentUrlInput, setContentUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [submittingContent, setSubmittingContent] = useState(false);

  // Published post URL input per submission
  const [postUrlInput, setPostUrlInput] = useState<{ [id: string]: string }>({});
  const [submittingPostId, setSubmittingPostId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, appsRes] = await Promise.all([
        api<MySubmission[]>("/submissions/mine").catch(() => []),
        api<MyApplication[]>("/applications/mine").catch(() => []),
      ]);
      setSubmissions(subsRes || []);
      // Filter for approved applications that may need submission
      const approved = (appsRes || []).filter((a) => a.status === "APPROVED");
      setApprovedApplications(approved);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCampaignId || submittingContent) return;

    setSubmittingContent(true);
    setErrorMessage("");
    setSuccessNotice("");

    try {
      await api("/submissions", {
        method: "POST",
        body: JSON.stringify({
          campaignId: activeModalCampaignId,
          contentUrl: contentUrlInput,
          caption: captionInput,
          notes: notesInput,
        }),
      });
      setSuccessNotice("Content submission uploaded successfully! The creator will review it.");
      setActiveModalCampaignId(null);
      setContentUrlInput("");
      setCaptionInput("");
      setNotesInput("");
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save submission");
    } finally {
      setSubmittingContent(false);
    }
  };

  const handlePostSubmit = async (subId: string) => {
    const url = postUrlInput[subId]?.trim();
    if (!url || submittingPostId) return;

    setSubmittingPostId(subId);
    setErrorMessage("");
    setSuccessNotice("");

    try {
      await api("/published-posts", {
        method: "POST",
        body: JSON.stringify({
          submissionId: subId,
          postUrl: url,
          platform: "Instagram",
        }),
      });
      setSuccessNotice("Published post URL submitted! Awaiting creator verification.");
      await fetchData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit post URL");
    } finally {
      setSubmittingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  // Approved campaigns that don't have an active submission yet
  const campaignsAwaitingInitialSubmission = approvedApplications.filter(
    (app) => !submissions.some((sub) => sub.campaignId === app.campaignId)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">My Submissions</h1>
          <p className="text-sm text-neutral-500">
            Submit draft content for approved campaigns, handle revisions, and supply published URLs.
          </p>
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

      {/* Campaigns Ready for Submission */}
      {campaignsAwaitingInitialSubmission.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Approved Applications Awaiting Content
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {campaignsAwaitingInitialSubmission.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-dashed border-navy/20 bg-white p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{app.campaign.title}</h4>
                  <p className="text-xs text-neutral-400">
                    Gross Payout: ₹{(app.campaign.rewardAmount / 100).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveModalCampaignId(app.campaignId);
                    setContentUrlInput("");
                    setCaptionInput("");
                    setNotesInput("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
                >
                  <PlusCircle size={13} /> Submit Content
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Modal / Box */}
      {activeModalCampaignId && (
        <div className="rounded-2xl border border-navy/20 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-navy/10 pb-3">
            <h3 className="text-base font-bold text-neutral-900">Submit Content Draft</h3>
            <button
              onClick={() => setActiveModalCampaignId(null)}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateOrResubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Content URL *</label>
              <input
                required
                type="url"
                value={contentUrlInput}
                onChange={(e) => setContentUrlInput(e.target.value)}
                placeholder="https://cloudinary.com/... or Google Drive public link"
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Proposed Caption</label>
              <textarea
                rows={2}
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder="Include hashtags and mentions..."
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Editor Notes</label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Any comments or turnaround context..."
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalCampaignId(null)}
                className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingContent}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white shadow-navy hover:opacity-90 disabled:opacity-50"
              >
                {submittingContent ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Upload Submission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 && !activeModalCampaignId ? (
          <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center text-sm text-neutral-500">
            You have not submitted any content yet. Once your campaign applications are approved, they will appear here.
          </div>
        ) : (
          submissions.map((sub) => {
            const gross = (sub.campaign?.rewardAmount ?? 0) / 100;
            const editorEarning = Math.floor(gross * 0.85);

            return (
              <div key={sub.id} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-neutral-900">{sub.campaign?.title ?? "Campaign"}</h3>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">Creator: {sub.campaign?.creator?.name ?? "Creator"}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Your Earning (85%)
                    </span>
                    <span className="text-base font-black text-emerald-600">₹{editorEarning.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-surface p-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <a
                    href={sub.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-navy hover:underline inline-flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} /> View Content Asset ({sub.contentUrl.substring(0, 35)}...)
                  </a>
                  {sub.caption && <span className="text-neutral-500">Caption: &ldquo;{sub.caption}&rdquo;</span>}
                </div>

                {/* Changes requested banner with action to resubmit */}
                {sub.status === "CHANGES_REQUESTED" && (
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs space-y-3">
                    <div className="text-amber-900 font-bold">
                      Changes Requested: <span className="font-normal text-amber-800">{sub.feedback || "Revisions required."}</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveModalCampaignId(sub.campaignId);
                        setContentUrlInput(sub.contentUrl);
                        setCaptionInput(sub.caption || "");
                        setNotesInput("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-800"
                    >
                      <RefreshCw size={12} /> Resubmit Revised Content
                    </button>
                  </div>
                )}

                {/* Content approved → publish and submit URL */}
                {sub.status === "APPROVED" && (
                  <div className="rounded-xl border border-dashed border-navy/20 p-4 space-y-3 bg-navy-soft/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-navy">
                      <Sparkles size={14} /> Next Step: Publish Content & Submit URL for Verification
                    </div>
                    <p className="text-xs text-neutral-500">
                      Your content has been approved! Publish it on the platform, then paste the public link below so the creator can verify and release your reward.
                    </p>

                    {sub.publishedPost ? (
                      <div className="flex items-center justify-between text-xs font-bold bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>
                            URL Submitted:{" "}
                            <a href={sub.publishedPost.postUrl} target="_blank" rel="noreferrer" className="underline font-mono">
                              {sub.publishedPost.postUrl}
                            </a>
                          </span>
                        </div>
                        <StatusBadge status={sub.publishedPost.status} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs">
                          <LinkIcon size={14} className="text-neutral-400" />
                          <input
                            placeholder="https://instagram.com/reel/..."
                            value={postUrlInput[sub.id] ?? ""}
                            disabled={submittingPostId === sub.id}
                            onChange={(e) => setPostUrlInput({ ...postUrlInput, [sub.id]: e.target.value })}
                            className="w-full bg-transparent outline-none disabled:opacity-50"
                          />
                        </div>
                        <button
                          onClick={() => handlePostSubmit(sub.id)}
                          disabled={submittingPostId === sub.id || !postUrlInput[sub.id]?.trim()}
                          className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-navy disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {submittingPostId === sub.id ? (
                            <>
                              <Loader2 size={12} className="animate-spin" /> Submitting...
                            </>
                          ) : (
                            "Submit Post URL"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
