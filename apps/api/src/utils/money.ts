/**
 * Calculate the platform fee and editor earning from a gross reward amount.
 * Uses integer minor units throughout (e.g. 1 INR = 100 paise).
 *
 * Formula:
 *   platformFee  = Math.floor(grossAmount * feePercentage / 100)
 *   netAmount    = grossAmount - platformFee
 *
 * The feePercentage is always read from AdminSetting — never hard-coded.
 */
export function calculatePlatformFee(
  grossAmount: number,
  feePercentage: number
): { platformFee: number; netAmount: number } {
  if (grossAmount < 0) throw new Error("grossAmount must be non-negative");
  if (feePercentage < 0 || feePercentage > 100)
    throw new Error("feePercentage must be between 0 and 100");

  const platformFee = Math.floor((grossAmount * feePercentage) / 100);
  const netAmount = grossAmount - platformFee;

  return { platformFee, netAmount };
}

/**
 * Format a minor-unit integer amount into a human-readable currency string.
 * e.g. formatMoney(100000, "INR") → "₹1,000"
 */
export function formatMoney(amountInMinorUnits: number, currency = "INR"): string {
  const majorAmount = amountInMinorUnits / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(majorAmount);
}

/** Convert a major-unit number (e.g. 1000) to minor units (e.g. 100000 paise). */
export function toMinorUnits(majorAmount: number): number {
  return Math.round(majorAmount * 100);
}

/** Convert minor units back to major units (float). */
export function toMajorUnits(minorAmount: number): number {
  return minorAmount / 100;
}
