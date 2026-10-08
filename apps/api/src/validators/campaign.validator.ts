import { z } from "zod";

export const PLATFORMS = ["Instagram", "YouTube"] as const;
export const CATEGORIES = ["Fashion", "Beauty", "Tech", "Gaming", "Food", "Travel", "Fitness", "Education", "Entertainment", "Other"] as const;

export const createCampaignBaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(CATEGORIES),
  socialPlatform: z.enum(PLATFORMS, {
    errorMap: () => ({ message: "Social platform must be either Instagram or YouTube" }),
  }),
  videoUrl: z.string().url("Must be a valid video URL").optional().or(z.literal("")),

  // Campaign fund & slots (integer minor units, e.g. paise: ₹1,000 = 100000 paise)
  campaignFund: z.number().int().positive().min(100, "Minimum campaign fund is ₹1 (100 paise)").optional(),
  rewardAmount: z.number().int().positive().min(100, "Minimum reward amount is ₹1 (100 paise)").optional(),
  editorSlots: z.number().int().positive().min(1, "Campaign must have at least 1 editor slot").default(1),
  earningPer1000Views: z.number().int().positive("Earning rate per 1,000 views must be positive in minor units").optional(),
  minimumViews: z.number().int().nonnegative("Minimum views cannot be negative").default(0),
  platformFeePercentage: z.number().int().min(0).max(99).optional(),

  currency: z.string().length(3).default("INR"),
  deadline: z.string().datetime().refine((d) => new Date(d) > new Date(), "Deadline must be in the future"),
  thumbnail: z.string().url().optional().or(z.literal("")),
  contentRequirements: z.string().max(2000).optional(),
  captionRequirements: z.string().max(1000).optional(),
  hashtagRequirements: z.string().max(500).optional(),
  mentionRequirements: z.string().max(500).optional(),
  minimumEngagement: z.number().int().nonnegative().default(0),
  additionalInstructions: z.string().max(2000).optional(),
});

export const createCampaignSchema = createCampaignBaseSchema.refine((data) => Boolean(data.campaignFund || data.rewardAmount), {
  message: "Either campaignFund or rewardAmount is required",
  path: ["campaignFund"],
});

export const updateCampaignSchema = createCampaignBaseSchema.partial().omit({
  campaignFund: true,
  rewardAmount: true,
  editorSlots: true,
  platformFeePercentage: true,
});

export const campaignIdSchema = z.object({ id: z.string().uuid() });

export const campaignQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  socialPlatform: z.enum(PLATFORMS).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
