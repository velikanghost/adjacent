import { Token } from '@uniswap/sdk-core';
import { Pool, Position as V3Position } from '@uniswap/v3-sdk';
import { MONAD_MAINNET_CHAIN_ID, type Address } from '@adjacent/shared';

export interface TokenMeta {
  address: Address;
  decimals: number;
  symbol: string;
}

export interface RawLpPosition {
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
}

export interface PoolState {
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
}

export interface ComputedLp {
  amount0: bigint;
  amount1: bigint;
  inRange: boolean;
  /** Price of token0 denominated in token1. */
  token0Price: number;
}

/**
 * Derive the underlying token amounts of a concentrated-liquidity position
 * from its range, the pool's current price, and its liquidity, using the
 * canonical Uniswap v3 SDK math.
 */
export function computeLpAmounts(
  pos: RawLpPosition,
  pool: PoolState,
  meta0: TokenMeta,
  meta1: TokenMeta,
): ComputedLp {
  const token0 = new Token(MONAD_MAINNET_CHAIN_ID, meta0.address, meta0.decimals, meta0.symbol);
  const token1 = new Token(MONAD_MAINNET_CHAIN_ID, meta1.address, meta1.decimals, meta1.symbol);

  const v3Pool = new Pool(
    token0,
    token1,
    pos.fee,
    pool.sqrtPriceX96.toString(),
    pool.liquidity.toString(),
    pool.tick,
  );

  const position = new V3Position({
    pool: v3Pool,
    liquidity: pos.liquidity.toString(),
    tickLower: pos.tickLower,
    tickUpper: pos.tickUpper,
  });

  return {
    amount0: BigInt(position.amount0.quotient.toString()),
    amount1: BigInt(position.amount1.quotient.toString()),
    inRange: pool.tick >= pos.tickLower && pool.tick < pos.tickUpper,
    token0Price: Number(v3Pool.token0Price.toSignificant(8)),
  };
}
