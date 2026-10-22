export type AdminCampaignStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface AdminCampaign {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  socialPlatform: string;
  videoUrl: string | null;
  rewardAmount: number;
  maxEarn: number | null;
  campaignFund: number;
  platformFeePercentage: number;
  platformFee: number;
  editorRewardPool: number;
  editorSlots: number;
  maximumEditorEarning: number;
  earningPer1000Views: number;
  currency: string;
  deadline: string;
  status: AdminCampaignStatus;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
  _count?: {
    applications: number;
    submissions: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "CREATOR" | "EDITOR" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  usersByRole: Array<{ role: string; _count: number }>;
  campaigns: Array<{ status: string; _count: number }>;
  rewards: Array<{ status: string; _count: number }>;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pausedCampaigns: number;
  draftCampaigns: number;
  totalWalletBalance: number;
  totalGMV: number;
  totalPlatformFeesEarned: number;
  totalDisbursedToEditors: number;
  totalSubmissions: number;
  totalPublishedPosts: number;
  pendingReports: number;
  recentCampaigns: AdminCampaign[];
  recentLogs: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    createdAt: string;
    actor?: {
      id: string;
      name: string;
      role: string;
    } | null;
  }>;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  entityType: string;
  entityId: string;
  reason: string;
  description: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  reporter?: {
    id: string;
    name: string;
  };
}

export interface AdminAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  metadata: unknown;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export const formatRupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
export const formatPaise = (paise: number) => `₹${(Math.floor(paise || 0) / 100).toLocaleString("en-IN")}`;
export const formatViews = (views: number) => (views || 0).toLocaleString("en-IN");
export const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};
