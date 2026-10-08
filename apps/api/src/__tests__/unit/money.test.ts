import { describe, it, expect } from "vitest";
import { calculatePlatformFee, formatMoney, toMinorUnits, toMajorUnits } from "../../utils/money";

describe("calculatePlatformFee", () => {
  it("calculates 15% fee for ₹1,000 (100000 paise)", () => {
    const result = calculatePlatformFee(100000, 15);
    expect(result.platformFee).toBe(15000);
    expect(result.netAmount).toBe(85000);
  });

  it("fee + netAmount always equals grossAmount", () => {
    const amounts = [100, 999, 10000, 33333, 1000000];
    const percentages = [10, 15, 20, 25];
    for (const amount of amounts) {
      for (const pct of percentages) {
        const { platformFee, netAmount } = calculatePlatformFee(amount, pct);
        expect(platformFee + netAmount).toBe(amount);
      }
    }
  });

  it("uses configurable fee percentage — NOT hard-coded 15", () => {
    const r20 = calculatePlatformFee(100000, 20);
    expect(r20.platformFee).toBe(20000);
    expect(r20.netAmount).toBe(80000);
  });

  it("handles zero amount", () => {
    const result = calculatePlatformFee(0, 15);
    expect(result.platformFee).toBe(0);
    expect(result.netAmount).toBe(0);
  });

  it("rounds down fractional paise (floor)", () => {
    // 33333 * 15 / 100 = 4999.95 → floor → 4999
    const result = calculatePlatformFee(33333, 15);
    expect(result.platformFee).toBe(4999);
    expect(result.netAmount).toBe(28334);
    expect(result.platformFee + result.netAmount).toBe(33333);
  });

  it("handles 0% fee (everything goes to editor)", () => {
    const result = calculatePlatformFee(100000, 0);
    expect(result.platformFee).toBe(0);
    expect(result.netAmount).toBe(100000);
  });

  it("handles 100% fee", () => {
    const result = calculatePlatformFee(100000, 100);
    expect(result.platformFee).toBe(100000);
    expect(result.netAmount).toBe(0);
  });

  it("throws on negative grossAmount", () => {
    expect(() => calculatePlatformFee(-100, 15)).toThrow();
  });

  it("throws on fee percentage > 100", () => {
    expect(() => calculatePlatformFee(100000, 101)).toThrow();
  });

  it("throws on negative fee percentage", () => {
    expect(() => calculatePlatformFee(100000, -1)).toThrow();
  });
});

describe("formatMoney", () => {
  it("formats 100000 paise as ₹1,000", () => {
    expect(formatMoney(100000, "INR")).toContain("1,000");
  });

  it("formats 85000 paise as ₹850", () => {
    expect(formatMoney(85000, "INR")).toContain("850");
  });
});

describe("toMinorUnits / toMajorUnits", () => {
  it("converts ₹1000 to 100000 paise", () => {
    expect(toMinorUnits(1000)).toBe(100000);
  });

  it("converts 100000 paise back to ₹1000", () => {
    expect(toMajorUnits(100000)).toBe(1000);
  });
});
