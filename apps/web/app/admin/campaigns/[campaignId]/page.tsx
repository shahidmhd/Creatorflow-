"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { formatRupees, type AdminCampaign, type AdminCampaignStatus } from "../../data";
import { readAdminCampaigns, saveAdminCampaign } from "../../campaign-store";

export default function AdminCampaignDetailPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<AdminCampaign | null>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCampaign(readAdminCampaigns().find((item) => item.id === params.campaignId) ?? null);
  }, [params.campaignId]);

  if (campaign === undefined) return <p className="text-sm text-neutral-500">Loading campaign…</p>;
  if (!campaign) {
    return (
      <section className="rounded-2xl border border-black/5 bg-white p-8 text-center">
        <h1 className="text-2xl font-black">Campaign not found</h1>
        <Link href="/admin/campaigns" className="mt-5 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white">Back to campaigns</Link>
      </section>
    );
  }

  const update = (patch: Partial<AdminCampaign>) =>
    setCampaign((current) => current ? { ...current, ...patch } : current);

  const save = () => {
    if (!campaign.title.trim() || !campaign.brand.trim() || campaign.poolTotal < 0 || campaign.poolRemaining < 0 || campaign.poolRemaining > campaign.poolTotal || campaign.submissions < 0) {
      setMessage("Check campaign details. Pool remaining cannot exceed the total pool.");
      return;
    }
    saveAdminCampaign(campaign);
    setMessage("Campaign override saved.");
  };

  const pauseOrResume = () => {
    const status: AdminCampaignStatus = campaign.status === "Paused" ? "Active" : "Paused";
    const updated = { ...campaign, status };
    setCampaign(updated);
    saveAdminCampaign(updated);
    setMessage(status === "Paused" ? "Campaign paused by admin override." : "Campaign resumed by admin override.");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-navy"><ArrowLeft size={16} /> Back to campaigns</Link>
      <div className="mb-7 mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.16em] text-navy">Admin override</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em]">Campaign details</h1>
          <p className="mt-2 text-sm text-neutral-500">Review and update platform campaign metadata.</p>
        </div>
        <button onClick={pauseOrResume} disabled={campaign.status === "Completed" || campaign.status === "Draft"} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
          {campaign.status === "Paused" ? "Resume campaign" : "Pause campaign"}
        </button>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Brand name</span><input value={campaign.brand} onChange={(event) => update({ brand: event.target.value })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Campaign title</span><input value={campaign.title} onChange={(event) => update({ title: event.target.value })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Niche</span><input value={campaign.niche} onChange={(event) => update({ niche: event.target.value })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Status</span><select value={campaign.status} onChange={(event) => update({ status: event.target.value as AdminCampaignStatus })} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10"><option>Draft</option><option>Active</option><option>Paused</option><option>Completed</option></select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Pool total (₹)</span><input type="number" min="0" step="any" value={campaign.poolTotal} onChange={(event) => update({ poolTotal: Number(event.target.value) })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-neutral-700">Pool remaining (₹)</span><input type="number" min="0" step="any" value={campaign.poolRemaining} onChange={(event) => update({ poolRemaining: Number(event.target.value) })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10" /></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-neutral-700">Submission count</span><input type="number" min="0" step="1" value={campaign.submissions} onChange={(event) => update({ submissions: Number(event.target.value) })} className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-navy/50 focus:ring-2 focus:ring-navy/10 sm:max-w-[calc(50%-0.625rem)]" /></label>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-5">
          <p className="text-sm text-neutral-500">Pool: <strong className="text-neutral-800">{formatRupees(campaign.poolRemaining)} remaining</strong> of {formatRupees(campaign.poolTotal)}</p>
          <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white shadow-navy"><Save size={15} /> Save override</button>
        </div>
        {message && <p role="status" className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700">{message}</p>}
      </section>
    </div>
  );
}
