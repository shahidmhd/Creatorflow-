"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  Video,
  CheckCircle,
  Users,
  Calculator,
  Info,
  AlertCircle,
  Wallet as WalletIcon,
  Plus,
  Loader2,
  Trash2,
  Bold,
  Italic,
  List,
  ListOrdered,
  FileText,
  ExternalLink,
} from "lucide-react";
import { api, ApiError } from "@/app/api";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Quick Add Funds inside page
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | string>(10000);
  const [depositing, setDepositing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "Tech",
    socialPlatform: "Instagram", // Strictly Instagram or YouTube
    videoUrl: "",
    campaignFundMajor: 5000, // ₹5,000 INR default
    editorSlots: 5,
    earningRatePer1000ViewsMajor: 8.5, // ₹8.50 per 1,000 views
    minimumViews: 10000,
    deadline: "",
    mentionRequirements: "",
    hashtagRequirements: "",
    creativeGuidelines: "",
  });

  const guidelinesTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load wallet balance on mount
  useEffect(() => {
    api<WalletData>("/wallet")
      .then((data) => setWallet(data))
      .catch((err) => console.warn("Failed to load wallet balance:", err))
      .finally(() => setWalletLoading(false));

    // Default deadline to 7 days from now
    const sevenDaysLater = new Date(Date.now() + 86400000 * 7);
    const tzOffset = sevenDaysLater.getTimezoneOffset() * 60000;
    const localISOTime = new Date(sevenDaysLater.getTime() - tzOffset).toISOString().slice(0, 16);
    setForm((prev) => ({ ...prev, deadline: localISOTime }));
  }, []);

  // Financial Calculations
  const fund = Math.max(0, Number(form.campaignFundMajor) || 0);
  const slots = Math.max(1, Number(form.editorSlots) || 1);
  const platformFee = Math.floor(fund * 0.15); // 15% platform fee
  const editorRewardPool = fund - platformFee; // 85% editor pool
  const maxEditorEarning = Math.floor(editorRewardPool / slots);
  const ratePer1k = Math.max(0, Number(form.earningRatePer1000ViewsMajor) || 0);
  const viewsCap = ratePer1k > 0 ? Math.round((maxEditorEarning / ratePer1k) * 1000) : 0;

  const walletBalanceMajor = wallet ? Math.floor(wallet.balance / 100) : 0;
  const isInsufficientWallet = fund > walletBalanceMajor;

  // Cloudinary image upload handler using direct backend endpoint
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size exceeds 8MB limit. Please choose a smaller image.");
      return;
    }

    setUploading(true);
    setError("");
    setFieldErrors((prev) => ({ ...prev, thumbnail: [] }));

    try {
      // Convert to base64 data URI
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      // Send to direct Cloudinary backend upload endpoint
      const uploadRes = await api<{ url: string; publicId?: string }>("/upload", {
        method: "POST",
        body: JSON.stringify({ file: base64Data, folder: "creatorflow" }),
      });

      if (uploadRes?.url) {
        setForm((prev) => ({ ...prev, thumbnail: uploadRes.url }));
      } else {
        throw new Error("Did not receive image URL from upload server");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload image to Cloudinary";
      setError(`Image upload error: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  // Quick Deposit flow
  const handleQuickDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return;

    setDepositing(true);
    try {
      const res = await api<{ wallet: WalletData }>("/wallet/add-funds", {
        method: "POST",
        body: JSON.stringify({
          amount: Math.round(amt * 100),
          description: `Direct deposit for campaign creation`,
        }),
      });
      if (res?.wallet) {
        setWallet(res.wallet);
      }
      setIsAddFundsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add funds.");
    } finally {
      setDepositing(false);
    }
  };

  // Guidelines Editor Toolbar Helpers
  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = guidelinesTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.creativeGuidelines;
    const selected = text.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setForm((prev) => ({ ...prev, creativeGuidelines: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const insertTemplate = (templateContent: string) => {
    setForm((prev) => ({
      ...prev,
      creativeGuidelines: prev.creativeGuidelines
        ? `${prev.creativeGuidelines}\n\n${templateContent}`
        : templateContent,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish = true) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const campaignFundMinor = Math.round(fund * 100); // paise
      const earningPer1000ViewsMinor = Math.round(ratePer1k * 100); // paise

      // Check wallet balance
      if (wallet && campaignFundMinor > wallet.balance) {
        throw new Error(
          `Insufficient wallet balance. You have ₹${(wallet.balance / 100).toLocaleString("en-IN")}, but this campaign requires ₹${fund.toLocaleString("en-IN")}. Please add funds to your wallet.`
        );
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        thumbnail: form.thumbnail || undefined,
        category: form.category,
        socialPlatform: form.socialPlatform,
        videoUrl: form.videoUrl.trim() || undefined,

        // Core Financial Model Fields
        campaignFund: campaignFundMinor,
        rewardAmount: campaignFundMinor,
        editorSlots: slots,
        earningPer1000Views: earningPer1000ViewsMinor,
        minimumViews: Number(form.minimumViews) || 0,
        platformFeePercentage: 15,

        deadline: new Date(form.deadline).toISOString(),
        mentionRequirements: form.mentionRequirements.trim() || undefined,
        hashtagRequirements: form.hashtagRequirements.trim() || undefined,
        contentRequirements: form.creativeGuidelines.trim() || undefined,
      };

      const res = await api<{ id: string }>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (publish && res?.id) {
        await api(`/campaigns/${res.id}/publish`, { method: "POST" }).catch(() => null);
      }

      router.push("/creator/campaigns");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fields) {
          setFieldErrors(err.fields);
        }
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while creating the campaign.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Nav Back */}
      <Link
        href="/creator/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy transition"
      >
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-[-0.04em] text-neutral-900">
          Create New Campaign
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Fund short-form briefs, allocate editor slots, and launch verified-performance campaigns.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-black text-sm">Validation Error</p>
            <p className="font-semibold text-red-600 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Insufficient Funds Callout */}
      {!walletLoading && isInsufficientWallet && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Insufficient Wallet Balance</p>
              <p className="text-amber-700 mt-0.5">
                Your wallet balance is <strong>₹{walletBalanceMajor.toLocaleString("en-IN")}</strong>. You need{" "}
                <strong>₹{(fund - walletBalanceMajor).toLocaleString("en-IN")}</strong> more to fund this campaign.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddFundsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90 transition border border-navy/10 shrink-0"
          >
            <Plus size={13} /> Add Funds Now
          </button>
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
        {/* ══════════════════════════════════════════════════
            SECTION 1: CAMPAIGN DETAILS
        ══════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs space-y-5">
          <h2 className="text-base font-black tracking-[-0.02em] text-neutral-900">
            1. Campaign Details
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Campaign Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 30s High-Retention Hook Reel for Product Launch"
              className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none transition ${
                fieldErrors.title
                  ? "border-red-400 focus:border-red-500 bg-red-50/10"
                  : "border-navy/10 focus:border-navy"
              }`}
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.title.join(", ")}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Overview & Creative Brief *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain the product, core selling points, target emotion, and call to action..."
              className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none transition ${
                fieldErrors.description
                  ? "border-red-400 focus:border-red-500 bg-red-50/10"
                  : "border-navy/10 focus:border-navy"
              }`}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.description.join(", ")}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm font-semibold text-neutral-800 outline-none focus:border-navy"
              >
                {["Tech", "Gaming", "Fashion", "Beauty", "Fitness", "Food", "Travel", "Education", "Entertainment", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Social Platform *
              </label>
              <select
                value={form.socialPlatform}
                onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm font-bold text-navy outline-none focus:border-navy"
              >
                <option value="Instagram">Instagram (Reels / Feed)</option>
                <option value="YouTube">YouTube (Shorts / Long-form)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 2: THUMBNAIL & ASSETS (Cloudinary Direct)
        ══════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs space-y-5">
          <h2 className="text-base font-black tracking-[-0.02em] text-neutral-900">
            2. Thumbnail & Source Footage
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Campaign Thumbnail (Cloudinary Upload)
            </label>

            <div className="mt-2 flex flex-col sm:flex-row items-start gap-4">
              {/* Preview Box */}
              <div className="relative aspect-video w-48 shrink-0 overflow-hidden rounded-xl border border-navy/15 bg-neutral-900 flex items-center justify-center text-white">
                {form.thumbnail ? (
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-neutral-400">
                    <ImageIcon size={24} className="mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-semibold">16:9 Thumbnail</span>
                  </div>
                )}
                {form.thumbnail && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, thumbnail: "" }))}
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-red-600 transition"
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Upload Action */}
              <div className="space-y-2 flex-1">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/20 bg-surface px-4 py-2.5 text-xs font-bold text-navy hover:bg-neutral-100 transition">
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-navy" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} />
                      <span>{form.thumbnail ? "Replace Image" : "Upload Thumbnail Image"}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    disabled={uploading}
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Recommended size: 1280x720 (16:9). Images are stored securely on Cloudinary CDN for instant loading.
                </p>
                {form.thumbnail && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                    <CheckCircle size={13} /> Stored on Cloudinary: {form.thumbnail.slice(0, 45)}...
                  </div>
                )}
              </div>
            </div>
            {fieldErrors.thumbnail && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.thumbnail.join(", ")}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Raw Footage / Asset Pack Link (Google Drive / Dropbox / Frame.io)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2.5">
              <Video size={16} className="text-navy shrink-0" />
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://drive.google.com/drive/folders/... or https://youtube.com/..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Editors will be given access to download this raw footage upon campaign application approval.
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 3: FINANCIAL & SLOTS ESCROW MODEL
        ══════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-navy/10 pb-3">
            <div>
              <h2 className="text-base font-black tracking-[-0.02em] text-neutral-900">
                3. Campaign Fund & Editor Slots
              </h2>
              <p className="text-xs text-neutral-400">
                Performance escrow backed directly by your wallet balance.
              </p>
            </div>

            {/* Wallet Status Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-navy-soft px-3 py-1.5 border border-navy/10">
              <WalletIcon size={14} className="text-navy" />
              <span className="text-xs font-bold text-neutral-700">
                Wallet Balance: <strong className="text-navy">₹{walletBalanceMajor.toLocaleString("en-IN")}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsAddFundsOpen(true)}
                className="text-[11px] font-black text-navy hover:underline ml-1"
              >
                + Top Up
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Campaign Fund (₹ INR) *
              </label>
              <input
                type="number"
                min="100"
                step="any"
                required
                value={form.campaignFundMajor}
                onChange={(e) => setForm({ ...form, campaignFundMajor: Number(e.target.value) })}
                className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm font-bold outline-none transition ${
                  isInsufficientWallet
                    ? "border-amber-400 text-amber-900 bg-amber-50/20"
                    : "border-navy/10 text-navy focus:border-navy"
                }`}
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Total escrow to reserve</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Editor Slots *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={form.editorSlots}
                onChange={(e) => setForm({ ...form, editorSlots: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm font-bold text-neutral-800 outline-none focus:border-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Max editors accepted</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Rate (₹ / 1,000 Views) *
              </label>
              <input
                type="number"
                min="0.5"
                step="any"
                required
                value={form.earningRatePer1000ViewsMajor}
                onChange={(e) => setForm({ ...form, earningRatePer1000ViewsMajor: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm font-bold text-emerald-600 outline-none focus:border-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Reward per 1k verified views</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Campaign Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-xs font-semibold outline-none transition ${
                  fieldErrors.deadline
                    ? "border-red-400 focus:border-red-500 bg-red-50/10"
                    : "border-navy/10 focus:border-navy"
                }`}
              />
              {fieldErrors.deadline && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">{fieldErrors.deadline.join(", ")}</p>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TRANSPARENT FINANCIAL & SLOT DISTRIBUTION
          ══════════════════════════════════════════════════ */}
          <div className="rounded-2xl border border-navy/10 bg-navy-soft/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-wider">
                <Calculator size={15} /> Transparent Financial & Slot Distribution
              </div>
              <span className="text-[11px] font-bold text-neutral-400">
                15% Platform Maintenance · 85% Direct Talent Share
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3.5 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Campaign Fund
                </span>
                <span className="text-lg font-black text-neutral-900 mt-0.5 block">
                  ₹{fund.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-neutral-400">100% Escrow Reserved</span>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Platform Fee (15%)
                </span>
                <span className="text-lg font-black text-navy mt-0.5 block">
                  ₹{platformFee.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-neutral-400">Verification & Hosting</span>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Editor Pool (85%)
                </span>
                <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                  ₹{editorRewardPool.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">Total Payout Pool</span>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Max Per Editor ({slots} slots)
                </span>
                <span className="text-lg font-black text-emerald-700 mt-0.5 block">
                  ₹{maxEditorEarning.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-neutral-400">Per approved creator</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-white p-3.5 text-xs text-neutral-600 border border-navy/5">
              <Info size={15} className="shrink-0 text-navy mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                At <strong>₹{ratePer1k} per 1,000 verified views</strong>, an approved editor caps out at{" "}
                <strong>₹{maxEditorEarning.toLocaleString("en-IN")}</strong> upon achieving{" "}
                <strong>{viewsCap.toLocaleString()} verified views</strong>. Unclaimed or unverified pool balances automatically remain in your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 4: CONTENT & GUIDELINES (Formatted Editor)
        ══════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-navy/10 pb-3">
            <div>
              <h2 className="text-base font-black tracking-[-0.02em] text-neutral-900">
                4. Content & Guidelines
              </h2>
              <p className="text-xs text-neutral-400">
                Provide clear creative criteria, required tags, and deliverables instructions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Required Mentions
              </label>
              <input
                value={form.mentionRequirements}
                onChange={(e) => setForm({ ...form, mentionRequirements: e.target.value })}
                placeholder="e.g. @brandaccount @creatorflow"
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Account handles editors must tag in captions</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Required Hashtags
              </label>
              <input
                value={form.hashtagRequirements}
                onChange={(e) => setForm({ ...form, hashtagRequirements: e.target.value })}
                placeholder="e.g. #BrandName #Ad #CreatorFlow"
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Campaign hashtags required for verification</span>
            </div>
          </div>

          {/* Formatted Guidelines Editor */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                Creative Guidelines & Do&apos;s / Don&apos;ts
              </label>

              {/* Quick Template Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    insertTemplate(
                      "### Hook Requirements\n- Hook viewer in the first 2.5 seconds\n- Address a concrete pain point or surprise element\n- Maintain upbeat energy and crisp sound effects"
                    )
                  }
                  className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-[10px] font-bold text-neutral-700 hover:bg-navy-soft hover:text-navy transition"
                >
                  + Hook Template
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertTemplate(
                      "### Do's & Don'ts\n**DO:**\n- Include dynamic on-screen subtitles\n- Keep clip between 25-45 seconds\n- Use high-contrast color grading\n\n**DON'T:**\n- Do NOT use copyrighted music\n- Do NOT cover critical UI elements"
                    )
                  }
                  className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-[10px] font-bold text-neutral-700 hover:bg-navy-soft hover:text-navy transition"
                >
                  + Do&apos;s & Don&apos;ts
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertTemplate(
                      "### Deliverables Format\n- Aspect Ratio: 9:16 Vertical (1080x1920)\n- Frame Rate: 30fps or 60fps\n- Codec: H.264 / MP4 with stereo audio (-14 LUFS)"
                    )
                  }
                  className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-[10px] font-bold text-neutral-700 hover:bg-navy-soft hover:text-navy transition"
                >
                  + Specs
                </button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="rounded-t-xl border border-b-0 border-navy/10 bg-neutral-50 px-3 py-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="rounded p-1 text-neutral-600 hover:bg-neutral-200 transition"
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="rounded p-1 text-neutral-600 hover:bg-neutral-200 transition"
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <span className="h-4 w-px bg-neutral-300 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="rounded p-1 text-neutral-600 hover:bg-neutral-200 transition"
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("1. ")}
                className="rounded p-1 text-neutral-600 hover:bg-neutral-200 transition"
                title="Numbered List"
              >
                <ListOrdered size={14} />
              </button>
            </div>

            <textarea
              ref={guidelinesTextareaRef}
              rows={6}
              value={form.creativeGuidelines}
              onChange={(e) => setForm({ ...form, creativeGuidelines: e.target.value })}
              placeholder="Provide guidelines for editors (hooks, pacing, subtitles, color grading, deliverables)..."
              className="w-full rounded-b-xl border border-navy/10 bg-surface px-4 py-3 text-sm font-normal outline-none focus:border-navy font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ACTION BUTTONS (Modern Flat SaaS Style)
        ══════════════════════════════════════════════════ */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition active:scale-[0.99]"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading || isInsufficientWallet}
            className="rounded-full bg-navy px-8 py-2.5 text-xs font-bold text-white hover:bg-navy/90 transition active:scale-[0.99] border border-navy/10 disabled:opacity-50"
          >
            {loading ? "Publishing Campaign..." : "Publish & Fund Campaign"}
          </button>
        </div>
      </form>

      {/* ══════════════════════════════════════════════════
          QUICK ADD FUNDS MODAL
      ══════════════════════════════════════════════════ */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-navy/10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-soft text-navy">
                  <WalletIcon size={16} />
                </span>
                <div>
                  <h3 className="font-black text-base text-neutral-900">Add Campaign Funds</h3>
                  <p className="text-xs text-neutral-400">Current balance: ₹{walletBalanceMajor.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFundsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Deposit Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="any"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-xl border border-navy/15 bg-surface pl-8 pr-4 py-2.5 text-sm font-bold text-neutral-900 outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy/5">
                <button
                  type="button"
                  onClick={() => setIsAddFundsOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositing}
                  className="rounded-xl bg-navy px-5 py-2 text-xs font-bold text-white hover:bg-navy/90 border border-navy/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {depositing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} /> Add to Balance
                    </>
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
