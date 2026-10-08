"use client";

import { adminCampaigns, type AdminCampaign } from "./data";

const storageKey = "vantage-admin-campaign-overrides";

export function readAdminCampaigns(): AdminCampaign[] {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return adminCampaigns;

  try {
    const overrides = JSON.parse(saved) as Record<string, Partial<AdminCampaign>>;
    return adminCampaigns.map((campaign) => ({ ...campaign, ...overrides[campaign.id] }));
  } catch {
    localStorage.removeItem(storageKey);
    return adminCampaigns;
  }
}

export function saveAdminCampaign(campaign: AdminCampaign) {
  const saved = localStorage.getItem(storageKey);
  let overrides: Record<string, Partial<AdminCampaign>> = {};
  if (saved) {
    try {
      overrides = JSON.parse(saved) as Record<string, Partial<AdminCampaign>>;
    } catch {
      localStorage.removeItem(storageKey);
    }
  }
  overrides[campaign.id] = campaign;
  localStorage.setItem(storageKey, JSON.stringify(overrides));
}
