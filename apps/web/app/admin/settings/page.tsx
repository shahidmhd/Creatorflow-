"use client";

import { useEffect, useState } from "react";
import { Check, Percent, Save, Shield } from "lucide-react";
import { api } from "@/app/api";

export default function AdminSettingsPage() {
  const [feePercentage, setFeePercentage] = useState("15");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ value: string }>("/admin/settings/platformFeePercentage")
      .then((data) => {
        if (data?.value) setFeePercentage(data.value);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await api("/admin/settings/platformFeePercentage", {
        method: "PUT",
        body: JSON.stringify({ value: feePercentage }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to update setting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Platform Settings</h1>
        <p className="text-sm text-neutral-500">Configure global platform fee calculation parameters and business rules.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Percent size={18} className="text-navy" />
            <h2 className="text-lg font-black text-neutral-900">Platform Fee Rate</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Default platform cut taken from the gross campaign reward upon verification. Editors receive the remaining fraction.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Fee Percentage (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              required
              value={feePercentage}
              onChange={(e) => setFeePercentage(e.target.value)}
              className="w-32 rounded-xl border border-navy/10 bg-surface px-4 py-2 text-sm font-black outline-none focus:border-navy text-navy"
            />
            <span className="text-sm font-semibold text-neutral-600">% Gross Reward</span>
          </div>
        </div>

        <div className="rounded-xl bg-navy-soft/60 p-4 text-xs leading-5 text-neutral-600 space-y-1">
          <p className="font-bold text-navy flex items-center gap-1.5">
            <Shield size={14} /> Dynamic Ledger Enforcement
          </p>
          <p>
            When set to <strong>{feePercentage}%</strong>, a ₹1,000 campaign reward will credit ₹{Math.floor(1000 * (1 - Number(feePercentage) / 100))} to the editor wallet and ₹{Math.floor(1000 * (Number(feePercentage) / 100))} to platform fees.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check size={14} /> Settings updated successfully
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white shadow-navy hover:opacity-90"
          >
            <Save size={15} /> {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
