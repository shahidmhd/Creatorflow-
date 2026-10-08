import { describe, it, expect } from "vitest";
import { earningsCalculationService } from "../../services/earnings-calculation.service";
import { ValidationError } from "../../errors";

describe("EarningsCalculationService Unit Tests", () => {
  describe("calculateCampaignFinancials", () => {
    // Case 1: Standard Campaign Fund = ₹1,000, 10 editors, 15% platform fee
    it("Case 1: correctly calculates financials for ₹1,000 fund, 10 slots, 15% fee", () => {
      // ₹1,000 in minor units = 100,000 paise
      const result = earningsCalculationService.calculateCampaignFinancials({
        campaignFundMinor: 100000,
        editorSlots: 10,
        platformFeePercentage: 15,
      });

      expect(result.campaignFundMinor).toBe(100000);
      expect(result.platformFeePercentage).toBe(15);
      expect(result.platformFeeMinor).toBe(15000); // ₹150
      expect(result.editorRewardPoolMinor).toBe(85000); // ₹850
      expect(result.editorSlots).toBe(10);
      expect(result.maximumEditorEarningMinor).toBe(8500); // ₹85
    });

    // Case 3: Fund = ₹10,000, 5 editors, 15% fee
    it("Case 3: correctly calculates financials for ₹10,000 fund, 5 editors, 15% fee", () => {
      // ₹10,000 in paise = 1,000,000 paise
      const result = earningsCalculationService.calculateCampaignFinancials({
        campaignFundMinor: 1000000,
        editorSlots: 5,
        platformFeePercentage: 15,
      });

      expect(result.platformFeeMinor).toBe(150000); // ₹1,500
      expect(result.editorRewardPoolMinor).toBe(850000); // ₹8,500
      expect(result.maximumEditorEarningMinor).toBe(170000); // ₹1,700
    });

    // Case 4: Fund = ₹100, 3 editors, 15% fee (odd division / rounding)
    it("Case 4: safely truncates integer minor units with floor rounding for odd divisions (₹100, 3 slots)", () => {
      // ₹100 in paise = 10,000 paise
      const result = earningsCalculationService.calculateCampaignFinancials({
        campaignFundMinor: 10000,
        editorSlots: 3,
        platformFeePercentage: 15,
      });

      expect(result.platformFeeMinor).toBe(1500); // ₹15
      expect(result.editorRewardPoolMinor).toBe(8500); // ₹85
      // 8500 / 3 = 2833.333... -> Math.floor -> 2833 paise (₹28.33)
      expect(result.maximumEditorEarningMinor).toBe(2833);
      // Ensure sum of slots never exceeds total editor reward pool: 2833 * 3 = 8499 <= 8500
      expect(result.maximumEditorEarningMinor * 3).toBeLessThanOrEqual(result.editorRewardPoolMinor);
    });

    // Case 7: 0 editor slots rejected
    it("Case 7: rejects 0 or negative editor slots with ValidationError", () => {
      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 100000,
          editorSlots: 0,
        })
      ).toThrow(ValidationError);

      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 100000,
          editorSlots: -5,
        })
      ).toThrow(ValidationError);
    });

    // Case 8: Platform fee >= 100% rejected
    it("Case 8: rejects platform fee percentage >= 100% or < 0", () => {
      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 100000,
          editorSlots: 5,
          platformFeePercentage: 100,
        })
      ).toThrow(ValidationError);

      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 100000,
          editorSlots: 5,
          platformFeePercentage: -10,
        })
      ).toThrow(ValidationError);
    });

    // Case 9: Large integer values
    it("Case 9: correctly processes large fund values (₹10,000,000)", () => {
      const result = earningsCalculationService.calculateCampaignFinancials({
        campaignFundMinor: 1000000000, // ₹10,000,000 in paise
        editorSlots: 50,
        platformFeePercentage: 15,
      });

      expect(result.platformFeeMinor).toBe(150000000); // ₹1,500,000
      expect(result.editorRewardPoolMinor).toBe(850000000); // ₹8,500,000
      expect(result.maximumEditorEarningMinor).toBe(17000000); // ₹170,000
    });

    // Case 10: Non-integer minor units rejected
    it("Case 10: rejects non-integer minor units or non-positive funds", () => {
      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 100.5,
          editorSlots: 5,
        })
      ).toThrow(ValidationError);

      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: 0,
          editorSlots: 5,
        })
      ).toThrow(ValidationError);

      expect(() =>
        earningsCalculationService.calculateCampaignFinancials({
          campaignFundMinor: -5000,
          editorSlots: 5,
        })
      ).toThrow(ValidationError);
    });
  });

  describe("calculateEditorEarning", () => {
    const maxEditorEarning = 8500; // ₹85 max
    const ratePer1000Views = 850; // ₹8.50 per 1k views (850 paise)

    // Case 2: Verification at various view milestones
    it("Case 2: calculates correct view-based earnings and caps at maximum earning", () => {
      // 1,000 views -> 1 * 850 = 850 paise (₹8.50)
      const res1k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 1000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res1k.calculatedEarningMinor).toBe(850);
      expect(res1k.finalEarningMinor).toBe(850);
      expect(res1k.capped).toBe(false);

      // 2,000 views -> 2 * 850 = 1,700 paise (₹17.00)
      const res2k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 2000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res2k.calculatedEarningMinor).toBe(1700);
      expect(res2k.finalEarningMinor).toBe(1700);
      expect(res2k.capped).toBe(false);

      // 5,000 views -> 5 * 850 = 4,250 paise (₹42.50)
      const res5k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 5000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res5k.calculatedEarningMinor).toBe(4250);
      expect(res5k.finalEarningMinor).toBe(4250);
      expect(res5k.capped).toBe(false);

      // 10,000 views -> 10 * 850 = 8,500 paise (₹85.00, exact cap)
      const res10k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 1000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });

      const res10kActual = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 10000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res10kActual.calculatedEarningMinor).toBe(8500);
      expect(res10kActual.finalEarningMinor).toBe(8500);
      expect(res10kActual.capped).toBe(true);

      // 20,000 views -> calculated 17,000 paise, capped at 8,500 paise
      const res20k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 20000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res20k.calculatedEarningMinor).toBe(17000);
      expect(res20k.finalEarningMinor).toBe(8500);
      expect(res20k.capped).toBe(true);

      // 50,000 views -> calculated 42,500 paise, capped at 8,500 paise
      const res50k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 50000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res50k.calculatedEarningMinor).toBe(42500);
      expect(res50k.finalEarningMinor).toBe(8500);
      expect(res50k.capped).toBe(true);

      // 100,000 views -> calculated 85,000 paise, capped at 8,500 paise
      const res100k = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 100000,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res100k.calculatedEarningMinor).toBe(85000);
      expect(res100k.finalEarningMinor).toBe(8500);
      expect(res100k.capped).toBe(true);
    });

    // Case 5: 0 views -> earning 0
    it("Case 5: gives 0 earning for 0 verified views", () => {
      const res0 = earningsCalculationService.calculateEditorEarning({
        verifiedViews: 0,
        earningPer1000ViewsMinor: ratePer1000Views,
        maximumEditorEarningMinor: maxEditorEarning,
      });
      expect(res0.calculatedEarningMinor).toBe(0);
      expect(res0.finalEarningMinor).toBe(0);
      expect(res0.capped).toBe(false);
    });

    // Case 6: Negative inputs rejected
    it("Case 6: rejects negative views or rates with ValidationError", () => {
      expect(() =>
        earningsCalculationService.calculateEditorEarning({
          verifiedViews: -100,
          earningPer1000ViewsMinor: 850,
          maximumEditorEarningMinor: 8500,
        })
      ).toThrow(ValidationError);

      expect(() =>
        earningsCalculationService.calculateEditorEarning({
          verifiedViews: 1000,
          earningPer1000ViewsMinor: -850,
          maximumEditorEarningMinor: 8500,
        })
      ).toThrow(ValidationError);
    });
  });
});
