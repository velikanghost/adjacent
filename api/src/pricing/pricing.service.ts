import { Injectable, Logger } from '@nestjs/common';
import { parseAbi, type Address } from 'viem';
import {
  ADDRESSES,
  PYTH_ABI,
  PYTH_FEED_IDS,
  TOKEN_TO_PYTH_FEED,
  pythPriceToUsd,
  type Hex,
} from '@adjacent/shared';
import { ChainService } from '../chain/chain.service';

const PYTH = parseAbi(PYTH_ABI);
const TTL_MS = 30_000;

/**
 * USD pricing via the Pyth pull oracle. Prices are cached briefly in-memory;
 * a Mongo-backed cache can replace this later without changing callers.
 * Note: shMON→MON is NOT priced here — the vault's `convertToAssets` is the
 * source of truth for that (see ShmonadClient).
 */
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  private readonly cache = new Map<string, { value: number; expiry: number }>();

  constructor(private readonly chain: ChainService) {}

  async getMonUsd(): Promise<number | null> {
    return this.getPriceByFeed(PYTH_FEED_IDS.MON_USD);
  }

  /** USD price for a token address, or null if we have no feed for it. */
  async getUsdPrice(token: Address): Promise<number | null> {
    const feed = TOKEN_TO_PYTH_FEED[token.toLowerCase()];
    if (!feed) return null;
    return this.getPriceByFeed(feed);
  }

  private async getPriceByFeed(feedId: Hex): Promise<number | null> {
    const cached = this.cache.get(feedId);
    if (cached && cached.expiry > Date.now()) return cached.value;

    try {
      const [price, , expo] = await this.chain.getClient().readContract({
        address: ADDRESSES.pyth,
        abi: PYTH,
        functionName: 'getPriceUnsafe',
        args: [feedId],
      });
      const usd = pythPriceToUsd({ price, expo });
      this.cache.set(feedId, { value: usd, expiry: Date.now() + TTL_MS });
      return usd;
    } catch (error) {
      this.logger.error(`Pyth price read failed for feed ${feedId}`, error as Error);
      return null;
    }
  }
}
