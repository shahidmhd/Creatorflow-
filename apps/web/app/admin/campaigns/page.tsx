"use client";

import { useState } from "react";
import { StatusBadge } from "@/app/components";
import { ExternalLink } from "lucide-react";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState([
    { id: "c-1", title: "Summer Viral Reels Challenge", creator: "Alex Rivera", platform: "Instagram", reward: 100000, status: "PUBLISHED" },
    { id: "c-2", title: "Tech Unboxing Series", creator: "Neon Byte", platform: "YouTube", reward: 800000, status: "DRAFT" },
    { id: "c-3", title: "Fitness Transformation Clips", creator: "FitLife Hub", platform: "TikTok", reward: 300000, status: "COMPLETED" },
  ]);

  const handlePause = (id: string) => {
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: c.status === "PAUSED" ? "PUBLISHED" : "PAUSED" } : c)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-900">Campaign Oversight</h1>
        <p className="text-sm text-neutral-500">Monitor all creator campaigns and moderate marketplace listings.</p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface text-neutral-500 font-bold uppercase tracking-wider border-b border-navy/10">
            <tr>
              <th className="p-4">Campaign</th>
              <th className="p-4">Creator</th>
              <th className="p-4">Platform</th>
              <th className="p-4">Gross Reward</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/50">
                <td className="p-4 font-bold text-neutral-900">{c.title}</td>
                <td className="p-4 text-neutral-600">{c.creator}</td>
                <td className="p-4 text-neutral-500">{c.platform}</td>
                <td className="p-4 font-black text-navy">₹{(c.reward / 100).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handlePause(c.id)}
                    className="rounded-full border border-navy/20 px-3 py-1 font-bold text-navy hover:bg-navy-soft"
                  >
                    {c.status === "PAUSED" ? "Resume" : "Pause"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
