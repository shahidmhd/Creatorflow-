import { ValidationError } from "../errors";

export interface CampaignFinancialsResult {
  campaignFundMinor: number;
  platformFeePercentage: number;
  platformFeeMinor: number;
  editorRewardPoolMinor: number;
  editorSlots: number;
  maximumEditorEarningMinor: number;
}

export interface EditorEarningResult {
  verifiedViews: number;
  calculatedEarningMinor: number;
  maximumEditorEarningMinor: number;
  finalEarningMinor: number;
  capped: boolean;
}

export const earningsCalculationService = {
  /**
   * Authoritative calculation of campaign financial pool and editor slot caps.
   *
   * Business Rules:
   * 1. Platform fee is deducted FIRST from the campaign fund.
   * 2. Remaining 85% forms the editor reward pool.
   * 3. Maximum editor earning is the reward pool divided equally across editor slots.
   * 4. Uses integer minor units (paise) with deterministic Math.floor rounding.
   */
  calculateCampaignFinancials(params: {
    campaignFundMinor: number;
    platformFeePercentage?: number;
    editorSlots: number;
  }): CampaignFinancialsResult {
    const { campaignFundMinor, editorSlots } = params;
    const platformFeePercentage = params.platformFeePercentage ?? 15;

    if (!Number.isInteger(campaignFundMinor) || campaignFundMinor <= 0) {
      throw new ValidationError("Campaign fund must be a positive integer in minor units");
    }
    if (!Number.isInteger(editorSlots) || editorSlots <= 0) {
      throw new ValidationError("Editor slots must be a positive integer greater than or equal to 1");
    }
    if (typeof platformFeePercentage !== "number" || platformFeePercentage < 0 || platformFeePercentage >= 100) {
      throw new ValidationError("Platform fee percentage must be between 0 and 99");
    }

    // Step 1: Calculate Platform Fee (15% by default)
    const platformFeeMinor = Math.floor((campaignFundMinor * platformFeePercentage) / 100);

    // Step 2: Editor Reward Pool (Remaining 85%)
    const editorRewardPoolMinor = campaignFundMinor - platformFeeMinor;

    // Step 3: Maximum Earning Per Editor Slot
    const maximumEditorEarningMinor = Math.floor(editorRewardPoolMinor / editorSlots);

    return {
      campaignFundMinor,
      platformFeePercentage,
      platformFeeMinor,
      editorRewardPoolMinor,
      editorSlots,
      maximumEditorEarningMinor,
    };
  },

  /**
   * Authoritative calculation of an editor's verified view-based earnings.
   *
   * Formula:
   * calculatedEarning = Math.floor((verifiedViews / 1000) * earningPer1000ViewsMinor)
   * finalEditorEarning = Math.min(calculatedEarning, maximumEditorEarningMinor)
   *
   * If calculatedEarning exceeds or reaches maximumEditorEarningMinor, capped is true.
   */
  calculateEditorEarning(params: {
    verifiedViews: number;
    earningPer1000ViewsMinor: number;
    maximumEditorEarningMinor: number;
  }): EditorEarningResult {
    const { verifiedViews, earningPer1000ViewsMinor, maximumEditorEarningMinor } = params;

    if (!Number.isFinite(verifiedViews) || verifiedViews < 0) {
      throw new ValidationError("Verified views must be a non-negative number");
    }
    if (!Number.isInteger(earningPer1000ViewsMinor) || earningPer1000ViewsMinor < 0) {
      throw new ValidationError("Earning rate per 1,000 views must be a non-negative integer in minor units");
    }
    if (!Number.isInteger(maximumEditorEarningMinor) || maximumEditorEarningMinor < 0) {
      throw new ValidationError("Maximum editor earning must be a non-negative integer in minor units");
    }

    // Deterministic integer floor rounding: (verifiedViews / 1000) * rate
    const calculatedEarningMinor = Math.floor((verifiedViews / 1000) * earningPer1000ViewsMinor);
    const finalEarningMinor = Math.min(calculatedEarningMinor, maximumEditorEarningMinor);
    const capped = calculatedEarningMinor >= maximumEditorEarningMinor && maximumEditorEarningMinor > 0;

    return {
      verifiedViews,
      calculatedEarningMinor,
      maximumEditorEarningMinor,
      finalEarningMinor,
      capped,
    };
  },
};
