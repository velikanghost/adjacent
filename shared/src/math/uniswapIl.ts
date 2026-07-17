import type { IlCurvePoint } from '../positions/model';

const Q96 = 2 ** 96;

/** Standard price-change grid the IL curve is sampled over: −60% … +60%. */
export const IL_CURVE_CHANGES: number[] = Array.from(
  { length: 25 },
  (_, i) => -0.6 + i * 0.05,
);

export interface V3IlParams {
  /** Position liquidity (L) as a float. */
  liquidity: number;
  /** Current pool sqrtPriceX96 as a decimal string. */
  sqrtPriceX96: string;
  tickLower: number;
  tickUpper: number;
  decimals0: number;
  decimals1: number;
}

/** Uniswap v3 token amounts at a given sqrt price, in raw base units. */
function amountsAtSqrt(
  liquidity: number,
  s: number,
  sa: number,
  sb: number,
): { amount0: number; amount1: number } {
  if (s <= sa) return { amount0: liquidity * (1 / sa - 1 / sb), amount1: 0 };
  if (s >= sb) return { amount0: 0, amount1: liquidity * (sb - sa) };
  return { amount0: liquidity * (1 / s - 1 / sb), amount1: liquidity * (s - sa) };
}

/**
 * Position-specific impermanent loss for a concentrated Uniswap v3 position:
 * the LP's value versus simply holding its *current* token composition, as the
 * token0/token1 price moves. Returns fractions (≤ 0 in the earning region).
 *
 * Unlike the generic 50/50 formula, this reflects the position's actual range —
 * within the band it behaves like a leveraged v2 position; outside it converts
 * fully to one asset. Analytic float math: precise enough for a chart, no SDK.
 */
export function computeV3IlCurve(
  params: V3IlParams,
  changes: number[] = IL_CURVE_CHANGES,
): IlCurvePoint[] {
  const sCur = Number(BigInt(params.sqrtPriceX96)) / Q96;
  const sa = Math.pow(1.0001, params.tickLower / 2);
  const sb = Math.pow(1.0001, params.tickUpper / 2);
  const scale0 = Math.pow(10, params.decimals0);
  const scale1 = Math.pow(10, params.decimals1);
  const decFactor = Math.pow(10, params.decimals0 - params.decimals1);

  const current = amountsAtSqrt(params.liquidity, sCur, sa, sb);
  const held0 = current.amount0 / scale0;
  const held1 = current.amount1 / scale1;

  return changes.map((priceChange) => {
    const s = sCur * Math.sqrt(1 + priceChange);
    const priceHuman = s * s * decFactor; // token1 per token0, human units
    const { amount0, amount1 } = amountsAtSqrt(params.liquidity, s, sa, sb);
    const positionValue = (amount0 / scale0) * priceHuman + amount1 / scale1;
    const hodlValue = held0 * priceHuman + held1;
    const il = hodlValue > 0 ? positionValue / hodlValue - 1 : 0;
    return { priceChange, il };
  });
}
