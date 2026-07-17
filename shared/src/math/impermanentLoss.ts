/**
 * Impermanent loss vs. simply holding, for a constant-product 50/50 pool, as a
 * function of the relative price change `r = priceNow / priceEntry` of the two
 * pooled assets.
 *
 * Returns a fraction ≤ 0 (e.g. `-0.0057` = −0.57%). Deterministic: given a
 * price ratio, IL is fixed — this is not a forecast. Used both for the
 * educational "if price moves X%, IL ≈ Y%" curve and realized IL when an entry
 * price is known.
 */
export function impermanentLoss(priceRatio: number): number {
  if (!Number.isFinite(priceRatio) || priceRatio <= 0) return 0
  return (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1
}

/** Build a forward-looking IL curve across a range of price changes (as fractions, e.g. 0.1 = +10%). */
export function impermanentLossCurve(
  priceChanges: number[],
): { priceChange: number; il: number }[] {
  return priceChanges.map((priceChange) => ({
    priceChange,
    il: impermanentLoss(1 + priceChange),
  }))
}
