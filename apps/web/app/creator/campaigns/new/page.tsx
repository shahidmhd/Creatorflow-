"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Sparkles, UploadCloud, Video, CheckCircle, Users, Calculator, Info } from "lucide-react";
import Link from "next/link";
import { api } from "@/app/api";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "Tech",
    socialPlatform: "Instagram", // Strictly Instagram or YouTube
    videoUrl: "",
    campaignFundMajor: 1000, // ₹1,000 INR default
    editorSlots: 10,
    earningRatePer1000ViewsMajor: 8.5, // ₹8.50 per 1,000 views
    minimumViews: 10000,
    deadline: "",
    captionRequirements: "",
    hashtagRequirements: "",
    mentionRequirements: "",
    minimumEngagement: 0,
    additionalInstructions: "",
  });

  // Client preview calculation (Authoritative calculation will be enforced by Backend)
  const fund = Math.max(0, Number(form.campaignFundMajor) || 0);
  const slots = Math.max(1, Number(form.editorSlots) || 1);
  const platformFee = Math.floor(fund * 0.15); // 15% platform fee
  const editorRewardPool = fund - platformFee; // 85% editor pool
  const maxEditorEarning = Math.floor(editorRewardPool / slots);
  const ratePer1k = Math.max(0, Number(form.earningRatePer1000ViewsMajor) || 0);

  // Cloudinary image upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const signData = await api<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      }>("/upload/sign", { method: "POST" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const clRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const clJson = await clRes.json();
      if (clJson.secure_url) {
        setForm((prev) => ({ ...prev, thumbnail: clJson.secure_url }));
      } else {
        throw new Error(clJson.error?.message || "Cloudinary upload failed");
      }
    } catch (err) {
      console.warn("Cloudinary fallback:", err);
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, thumbnail: previewUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const campaignFundMinor = Math.round(fund * 100); // minor units (paise)
      const earningPer1000ViewsMinor = Math.round(ratePer1k * 100); // minor units (paise)

      const payload = {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail || undefined,
        category: form.category,
        socialPlatform: form.socialPlatform, // "Instagram" | "YouTube"
        videoUrl: form.videoUrl || undefined,

        // Core Financial Model Fields
        campaignFund: campaignFundMinor,
        rewardAmount: campaignFundMinor,
        editorSlots: slots,
        earningPer1000Views: earningPer1000ViewsMinor,
        minimumViews: Number(form.minimumViews) || 0,
        platformFeePercentage: 15,

        deadline: new Date(form.deadline || Date.now() + 86400000 * 7).toISOString(),
        captionRequirements: form.captionRequirements || undefined,
        hashtagRequirements: form.hashtagRequirements || undefined,
        mentionRequirements: form.mentionRequirements || undefined,
        minimumEngagement: Number(form.minimumEngagement) || 0,
        additionalInstructions: form.additionalInstructions || undefined,
      };

      const res = await api<{ id: string }>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (publish && res?.id) {
        await api(`/campaigns/${res.id}/publish`, { method: "POST" });
      }

      router.push("/creator/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/creator/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-navy"
      >
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Create Campaign</h1>
        <p className="text-sm text-neutral-500">
          Configure campaign fund, editor slots, verified view rate, and creative guidelines.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
        {/* Section 1: Basic Info */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-neutral-900">1. Campaign Details</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Campaign Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 30s High-Retention Reel for Product Launch"
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Description / Creative Brief *
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your vision, target hook, pacing, and core message..."
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none font-semibold text-neutral-800"
              >
                {["Tech", "Gaming", "Fashion", "Beauty", "Fitness", "Food", "Travel", "Education", "Entertainment", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Social Platform * (Instagram or YouTube only)
              </label>
              <select
                value={form.socialPlatform}
                onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none font-bold text-navy"
              >
                <option value="Instagram">Instagram (Reels / Feed)</option>
                <option value="YouTube">YouTube (Shorts / Video)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Media & Assets */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-neutral-900">2. Media & Assets</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Thumbnail Image
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-navy/30 bg-surface px-4 py-3 text-xs font-bold text-navy hover:bg-navy-soft transition">
                <UploadCloud size={16} />
                <span>{uploading ? "Uploading..." : "Choose Image File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>

              {form.thumbnail ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle size={14} /> Attached ({form.thumbnail.substring(0, 40)}...)
                </div>
              ) : (
                <span className="text-xs text-neutral-400">If no thumbnail is uploaded, a themed dummy placeholder will be shown automatically.</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Raw Footage / Video URL (Reference Link)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-navy/10 bg-surface px-3 py-2.5">
              <Video size={16} className="text-navy" />
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://drive.google.com/... or https://youtube.com/..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Slot-Based Earning Model */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-navy/10 pb-3">
            <div>
              <h2 className="text-lg font-black text-neutral-900">3. Campaign Fund & Editor Slots</h2>
              <p className="text-xs text-neutral-500">The platform deducts a 15% platform fee first; the remaining 85% pool is shared across editor slots.</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-navy bg-navy-soft px-3 py-1 rounded-full">
              <Sparkles size={13} /> 15% Fee Deducted Upfront
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Campaign Fund (₹ INR) *
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={form.campaignFundMajor}
                onChange={(e) => setForm({ ...form, campaignFundMajor: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy font-bold text-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Total budget for campaign</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Editor Slots *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={form.editorSlots}
                onChange={(e) => setForm({ ...form, editorSlots: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy font-bold text-neutral-800"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Max approved editors</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Earning Rate (₹ / 1,000 Views) *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={form.earningRatePer1000ViewsMajor}
                onChange={(e) => setForm({ ...form, earningRatePer1000ViewsMajor: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy font-bold text-emerald-600"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">e.g. ₹8.50 per 1,000 views</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Minimum Views Required
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.minimumViews}
                onChange={(e) => setForm({ ...form, minimumViews: Number(e.target.value) })}
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Threshold for maximum</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
              Campaign Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full sm:w-72 rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none focus:border-navy"
            />
          </div>

          {/* Transparent Live Financial & Slot Breakdown */}
          <div className="rounded-2xl border border-navy/10 bg-navy-soft/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-wider">
              <Calculator size={15} /> Transparent Financial & Slot Distribution
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="rounded-xl bg-white p-3 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-neutral-400">Campaign Fund</span>
                <span className="text-base font-black text-neutral-900">₹{fund.toLocaleString("en-IN")}</span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-neutral-400">Platform Fee (15%)</span>
                <span className="text-base font-black text-navy">₹{platformFee.toLocaleString("en-IN")}</span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-neutral-400">Editor Pool (85%)</span>
                <span className="text-base font-black text-emerald-600">₹{editorRewardPool.toLocaleString("en-IN")}</span>
              </div>

              <div className="rounded-xl bg-white p-3 border border-navy/5 shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-neutral-400">Max Per Editor Slot</span>
                <span className="text-base font-black text-emerald-700">₹{maxEditorEarning.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-white/80 p-3 text-[11px] text-neutral-600 border border-navy/5">
              <Info size={14} className="shrink-0 text-navy mt-0.5" />
              <span>
                At <strong>₹{ratePer1k} per 1,000 verified views</strong>, an approved editor will reach the maximum cap of{" "}
                <strong>₹{maxEditorEarning.toLocaleString("en-IN")}</strong> at approximately{" "}
                <strong>{ratePer1k > 0 ? Math.round((maxEditorEarning / ratePer1k) * 1000).toLocaleString() : 0} verified views</strong>.
                Additional views beyond the cap will not increase the reward.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Content Guidelines */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-neutral-900">4. Content & Guidelines</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Required Hashtags</label>
              <input
                value={form.hashtagRequirements}
                onChange={(e) => setForm({ ...form, hashtagRequirements: e.target.value })}
                placeholder="#BrandLaunch #SummerEdit"
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Required Mentions</label>
              <input
                value={form.mentionRequirements}
                onChange={(e) => setForm({ ...form, mentionRequirements: e.target.value })}
                placeholder="@brandaccount"
                className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Caption Requirements</label>
            <textarea
              rows={2}
              value={form.captionRequirements}
              onChange={(e) => setForm({ ...form, captionRequirements: e.target.value })}
              placeholder="e.g. Must include link in bio prompt..."
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Additional Instructions</label>
            <textarea
              rows={2}
              value={form.additionalInstructions}
              onChange={(e) => setForm({ ...form, additionalInstructions: e.target.value })}
              placeholder="Pacing recommendations, music rights, deliverables format..."
              className="w-full rounded-xl border border-navy/10 bg-surface px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-full border border-navy/20 px-6 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-navy px-8 py-2.5 text-xs font-bold text-white shadow-navy hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
