/** Decoded Pyth price tuple from `getPriceUnsafe`. */
export interface PythPrice {
  price: bigint
  conf: bigint
  expo: number
  publishTime: bigint
}

/**
 * Convert a Pyth price to a USD float: `price * 10^expo`.
 * expo is typically negative (e.g. -8), so this scales down.
 */
export function pythPriceToUsd(price: { price: bigint; expo: number }): number {
  return Number(price.price) * 10 ** price.expo
}

/**
 * A Pyth pull-oracle value is stale if it hasn't been pushed recently. Default
 * tolerance is 2 minutes. `nowSec` is injectable for testing.
 */
export function isPythPriceStale(
  publishTime: bigint,
  maxAgeSec = 120,
  nowSec: number = Math.floor(Date.now() / 1000),
): boolean {
  return nowSec - Number(publishTime) > maxAgeSec
}
