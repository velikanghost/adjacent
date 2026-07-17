import { Injectable, Logger } from '@nestjs/common';
import { formatUnits, getAddress, parseAbi, type Address } from 'viem';
import {
  ADDRESSES,
  ERC20_ABI,
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_V3_POOL_ABI,
  UNISWAP_V3_POSITION_MANAGER_ABI,
  computeV3IlCurve,
  type IlCurvePoint,
  type Position,
  type RiskLevel,
  type TokenAmount,
} from '@adjacent/shared';
import { ChainService } from '../../chain/chain.service';
import { PricingService } from '../../pricing/pricing.service';
import type { ProtocolClient } from '../protocol-client.interface';
import {
  computeLpAmounts,
  type PoolState,
  type TokenMeta,
} from './uniswap.math';

const NPM_ABI = parseAbi(UNISWAP_V3_POSITION_MANAGER_ABI);
const FACTORY_ABI = parseAbi(UNISWAP_V3_FACTORY_ABI);
const POOL_ABI = parseAbi(UNISWAP_V3_POOL_ABI);
const ERC20 = parseAbi(ERC20_ABI);

const NPM = ADDRESSES.uniswapV3.positionManager as Address;
const FACTORY = ADDRESSES.uniswapV3.factory as Address;
const MAX_POSITIONS = 50;

interface ActivePosition {
  tokenId: bigint;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

/**
 * Uniswap v3 LP positions. Enumerates the owner's NonfungiblePositionManager
 * NFTs, derives underlying amounts from pool state via the v3 SDK, prices them
 * with Pyth, and reports range status and uncollected (synced) fees.
 */
@Injectable()
export class UniswapV3Client implements ProtocolClient {
  readonly id = 'uniswap-v3' as const;
  private readonly logger = new Logger(UniswapV3Client.name);

  constructor(
    private readonly chain: ChainService,
    private readonly pricing: PricingService,
  ) {}

  async getPositions(address: Address): Promise<Position[]> {
    const client = this.chain.getClient();

    const count = (await client.readContract({
      address: NPM,
      abi: NPM_ABI,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint;

    const n = Math.min(Number(count), MAX_POSITIONS);
    if (n === 0) return [];

    const active = await this.loadActivePositions(client, address, n);
    if (active.length === 0) return [];

    const metaMap = await this.loadTokenMeta(client, active);
    const poolStates = await this.loadPoolStates(client, active);

    const positions: Position[] = [];
    for (const p of active) {
      const meta0 = metaMap.get(p.token0.toLowerCase());
      const meta1 = metaMap.get(p.token1.toLowerCase());
      const poolState = poolStates.get(p.tokenId.toString());
      if (!meta0 || !meta1 || !poolState) continue;

      try {
        positions.push(await this.buildPosition(p, poolState, meta0, meta1));
      } catch (error) {
        this.logger.error(`Failed to build Uniswap position ${p.tokenId}`, error as Error);
      }
    }
    return positions;
  }

  private async loadActivePositions(
    client: ReturnType<ChainService['getClient']>,
    owner: Address,
    n: number,
  ): Promise<ActivePosition[]> {
    const tokenIds = (await client.multicall({
      allowFailure: false,
      contracts: Array.from({ length: n }, (_, i) => ({
        address: NPM,
        abi: NPM_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [owner, BigInt(i)],
      })),
    })) as unknown as bigint[];

    const raw = (await client.multicall({
      allowFailure: false,
      contracts: tokenIds.map((id) => ({
        address: NPM,
        abi: NPM_ABI,
        functionName: 'positions',
        args: [id],
      })),
    })) as unknown as unknown[][];

    return tokenIds
      .map((tokenId, i) => {
        const p = raw[i];
        return {
          tokenId,
          token0: p[2] as Address,
          token1: p[3] as Address,
          fee: Number(p[4]),
          tickLower: Number(p[5]),
          tickUpper: Number(p[6]),
          liquidity: p[7] as bigint,
          tokensOwed0: p[10] as bigint,
          tokensOwed1: p[11] as bigint,
        };
      })
      .filter((p) => p.liquidity > 0n || p.tokensOwed0 > 0n || p.tokensOwed1 > 0n);
  }

  private async loadTokenMeta(
    client: ReturnType<ChainService['getClient']>,
    active: ActivePosition[],
  ): Promise<Map<string, TokenMeta>> {
    const tokens = Array.from(
      new Set(active.flatMap((p) => [p.token0.toLowerCase(), p.token1.toLowerCase()])),
    );

    const results = await client.multicall({
      allowFailure: true,
      contracts: tokens.flatMap((addr) => [
        { address: addr as Address, abi: ERC20, functionName: 'decimals' },
        { address: addr as Address, abi: ERC20, functionName: 'symbol' },
      ]),
    });

    const map = new Map<string, TokenMeta>();
    tokens.forEach((addr, idx) => {
      const dec = results[idx * 2];
      const sym = results[idx * 2 + 1];
      map.set(addr, {
        address: getAddress(addr),
        decimals: dec.status === 'success' ? Number(dec.result) : 18,
        symbol: sym.status === 'success' ? String(sym.result) : '?',
      });
    });
    return map;
  }

  private async loadPoolStates(
    client: ReturnType<ChainService['getClient']>,
    active: ActivePosition[],
  ): Promise<Map<string, PoolState>> {
    const poolAddrs = (await client.multicall({
      allowFailure: false,
      contracts: active.map((p) => ({
        address: FACTORY,
        abi: FACTORY_ABI,
        functionName: 'getPool',
        args: [p.token0, p.token1, p.fee],
      })),
    })) as unknown as Address[];

    const states = await client.multicall({
      allowFailure: true,
      contracts: poolAddrs.flatMap((pool) => [
        { address: pool, abi: POOL_ABI, functionName: 'slot0' },
        { address: pool, abi: POOL_ABI, functionName: 'liquidity' },
      ]),
    });

    const byTokenId = new Map<string, PoolState>();
    active.forEach((p, idx) => {
      const slot0 = states[idx * 2];
      const liq = states[idx * 2 + 1];
      if (slot0.status !== 'success' || liq.status !== 'success') return;
      const slot = slot0.result as unknown as unknown[];
      byTokenId.set(p.tokenId.toString(), {
        sqrtPriceX96: slot[0] as bigint,
        tick: Number(slot[1]),
        liquidity: liq.result as bigint,
      });
    });
    return byTokenId;
  }

  private async buildPosition(
    p: ActivePosition,
    poolState: PoolState,
    meta0: TokenMeta,
    meta1: TokenMeta,
  ): Promise<Position> {
    const { amount0, amount1, inRange, token0Price } = computeLpAmounts(
      {
        token0: p.token0,
        token1: p.token1,
        fee: p.fee,
        tickLower: p.tickLower,
        tickUpper: p.tickUpper,
        liquidity: p.liquidity,
      },
      poolState,
      meta0,
      meta1,
    );

    const [price0, price1] = await Promise.all([
      this.pricing.getUsdPrice(p.token0),
      this.pricing.getUsdPrice(p.token1),
    ]);

    const asset0 = toTokenAmount(meta0, amount0, price0);
    const asset1 = toTokenAmount(meta1, amount1, price1);
    const fee0 = toTokenAmount(meta0, p.tokensOwed0, price0);
    const fee1 = toTokenAmount(meta1, p.tokensOwed1, price1);

    const valueUSD =
      asset0.valueUSD !== null && asset1.valueUSD !== null
        ? asset0.valueUSD + asset1.valueUSD
        : null;
    const feePct = (p.fee / 10000).toFixed(2);
    const ilCurve = this.computeIlCurve(p, poolState, meta0, meta1);
    const risk = classifyLpRisk(inRange, p, poolState.tick, meta0.symbol, meta1.symbol, feePct);

    return {
      id: `uniswap-v3:lp:${p.tokenId}`,
      protocol: 'uniswap-v3',
      type: 'lp',
      label: `${meta0.symbol}/${meta1.symbol} ${feePct}% LP`,
      valueUSD,
      assets: [asset0, asset1],
      rewards: [fee0, fee1].filter((f) => f.amount !== '0'),
      metrics: {
        feeTier: `${feePct}%`,
        range: inRange ? 'In range' : 'Out of range',
        poolPrice: `${token0Price} ${meta1.symbol}/${meta0.symbol}`,
        tokenId: p.tokenId.toString(),
      },
      risk,
      ilCurve,
      raw: {
        tokenId: p.tokenId.toString(),
        tickLower: p.tickLower,
        tickUpper: p.tickUpper,
        liquidity: p.liquidity.toString(),
      },
    };
  }

  private computeIlCurve(
    p: ActivePosition,
    poolState: PoolState,
    meta0: TokenMeta,
    meta1: TokenMeta,
  ): IlCurvePoint[] | undefined {
    try {
      return computeV3IlCurve({
        liquidity: Number(p.liquidity),
        sqrtPriceX96: poolState.sqrtPriceX96.toString(),
        tickLower: p.tickLower,
        tickUpper: p.tickUpper,
        decimals0: meta0.decimals,
        decimals1: meta1.decimals,
      });
    } catch (error) {
      this.logger.warn(`IL curve computation failed for position ${p.tokenId}`);
      return undefined;
    }
  }
}

/**
 * LP risk from range status and how close the price is to the edge of the band.
 * (Liquidation-style 'danger' is reserved for lending positions, added later.)
 */
function classifyLpRisk(
  inRange: boolean,
  p: ActivePosition,
  currentTick: number,
  symbol0: string,
  symbol1: string,
  feePct: string,
): { level: RiskLevel; reason: string } {
  if (!inRange) {
    return {
      level: 'watch',
      reason: `Out of range — not currently earning fees. Fees resume when the ${symbol0}/${symbol1} price re-enters your band.`,
    };
  }

  const width = p.tickUpper - p.tickLower;
  const edge = Math.min(currentTick - p.tickLower, p.tickUpper - currentTick);
  const proximity = width > 0 ? edge / width : 1;

  if (proximity < 0.08) {
    return {
      level: 'watch',
      reason: `In range but close to the edge of your band — a small ${symbol0} move could stop fee earnings. Earning ${feePct}% fees for now.`,
    };
  }

  return {
    level: 'safe',
    reason: `In range and earning ${feePct}% swap fees. Subject to impermanent loss if ${symbol0} and ${symbol1} diverge in price.`,
  };
}

function toTokenAmount(
  meta: TokenMeta,
  amount: bigint,
  price: number | null,
): TokenAmount {
  const formatted = formatUnits(amount, meta.decimals);
  return {
    symbol: meta.symbol,
    address: meta.address,
    decimals: meta.decimals,
    amount: amount.toString(),
    amountFormatted: formatted,
    valueUSD: price === null ? null : Number(formatted) * price,
  };
}
