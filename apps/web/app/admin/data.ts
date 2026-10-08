export type AdminCampaignStatus = "Draft" | "Active" | "Paused" | "Completed";
export type AdminCampaign = {
  id: string;
  brand: string;
  title: string;
  status: AdminCampaignStatus;
  poolTotal: number;
  poolRemaining: number;
  submissions: number;
  niche: string;
};

export type FlagReason = "Flat velocity" | "Low engagement" | "Duplicate clip" | "New account";
export type FraudStatus = "Flagged" | "Approved" | "Rejected";
export type FlaggedSubmission = {
  id: string;
  username: string;
  campaign: string;
  reasons: FlagReason[];
  rawViews: number;
  engagementRatio: string;
  accountAge: string;
  status: FraudStatus;
};

export const adminCampaigns: AdminCampaign[] = [
  { id: "new-episode-xyz", brand: "The Daily Mic", title: "New episode ft. XYZ", status: "Active", poolTotal: 50000, poolRemaining: 18500, submissions: 48, niche: "Podcast" },
  { id: "comedy-reel-bundle", brand: "Laugh Track Studios", title: "Comedy reel bundle", status: "Active", poolTotal: 40000, poolRemaining: 32000, submissions: 31, niche: "Comedy" },
  { id: "finance-shorts-push", brand: "Mint Money", title: "Finance shorts push", status: "Paused", poolTotal: 35000, poolRemaining: 27600, submissions: 26, niche: "Finance" },
  { id: "spring-creator-launch", brand: "Acme Brand", title: "Spring Creator Launch", status: "Active", poolTotal: 50000, poolRemaining: 45000, submissions: 12, niche: "Lifestyle" },
  { id: "product-story-series", brand: "Northstar Tech", title: "Product Story Series", status: "Completed", poolTotal: 30000, poolRemaining: 0, submissions: 74, niche: "Technology" },
  { id: "30-day-fitness-reset", brand: "Move Daily", title: "30-Day Fitness Reset", status: "Draft", poolTotal: 25000, poolRemaining: 0, submissions: 0, niche: "Fitness" },
];

export const flaggedSubmissions: FlaggedSubmission[] = [
  { id: "fraud-unknown-22", username: "unknown_user22", campaign: "New episode ft. XYZ", reasons: ["Flat velocity", "Low engagement"], rawViews: 18200, engagementRatio: "0.2%", accountAge: "3 days", status: "Flagged" },
  { id: "fraud-clipperfan-09", username: "clipperfan_09", campaign: "Comedy reel bundle", reasons: ["Duplicate clip"], rawViews: 9400, engagementRatio: "3.1%", accountAge: "8 months", status: "Flagged" },
  { id: "fraud-growthhack-x", username: "growthhack_x", campaign: "Finance shorts push", reasons: ["New account", "Flat velocity"], rawViews: 31000, engagementRatio: "0.4%", accountAge: "1 day", status: "Flagged" },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  joined: string;
  kind: "Brand" | "Clipper";
  metric: number;
  verified: boolean;
  suspended: boolean;
};

export const adminUsers: AdminUser[] = [
  { id: "brand-daily-mic", name: "The Daily Mic", email: "team@thedailymic.example", joined: "Jan 12, 2026", kind: "Brand", metric: 284500, verified: true, suspended: false },
  { id: "brand-laugh-track", name: "Laugh Track Studios", email: "hello@laughtrack.example", joined: "Feb 03, 2026", kind: "Brand", metric: 146000, verified: true, suspended: false },
  { id: "brand-mint-money", name: "Mint Money", email: "campaigns@mintmoney.example", joined: "Mar 18, 2026", kind: "Brand", metric: 91200, verified: false, suspended: false },
  { id: "clipper-meera", name: "Meera S.", email: "meera@example.com", joined: "Apr 05, 2026", kind: "Clipper", metric: 10110, verified: true, suspended: false },
  { id: "clipper-rahul", name: "Rahul K.", email: "rahul@example.com", joined: "May 19, 2026", kind: "Clipper", metric: 6430, verified: false, suspended: false },
  { id: "clipper-unknown", name: "unknown_user22", email: "unknown22@example.com", joined: "Sep 27, 2026", kind: "Clipper", metric: 0, verified: false, suspended: false },
];

export const commissionByDay = [
  5200, 6100, 4800, 7200, 6600, 7900, 5400, 8300, 6900, 9100,
  7600, 8800, 6300, 9700, 8400, 10200, 7800, 9200, 11100, 8700,
  10400, 9600, 11800, 8900, 12400, 10100, 13600, 11200, 14800, 16200,
];

export const commissionByNiche = [
  { niche: "Podcast", commission: 12400 },
  { niche: "Comedy", commission: 8200 },
  { niche: "Finance", commission: 15600 },
  { niche: "Gaming", commission: 6900 },
  { niche: "Technology", commission: 11300 },
  { niche: "Lifestyle", commission: 7400 },
];

export const formatRupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
export const formatViews = (views: number) => views.toLocaleString("en-IN");
