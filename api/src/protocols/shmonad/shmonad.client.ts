import { Injectable, Logger } from '@nestjs/common';
import { formatUnits, parseAbi, type Address } from 'viem';
import { ADDRESSES, ERC4626_ABI, type Position } from '@adjacent/shared';
import { ChainService } from '../../chain/chain.service';
import { PricingService } from '../../pricing/pricing.service';
import type { ProtocolClient } from '../protocol-client.interface';

const VAULT = parseAbi(ERC4626_ABI);
const SHMON = ADDRESSES.shmonad as Address;

/**
 * shMONAD liquid staking. shMON is a standard ERC-4626 vault over native MON:
 * value = convertToAssets(balanceOf(user)) MON, priced via MON/USD. The vault's
 * own rate is the source of truth (Pyth's shMON/MON feed disagrees with it).
 */
@Injectable()
export class ShmonadClient implements ProtocolClient {
  readonly id = 'shmonad' as const;
  private readonly logger = new Logger(ShmonadClient.name);

  constructor(
    private readonly chain: ChainService,
    private readonly pricing: PricingService,
  ) {}

  async getPositions(address: Address): Promise<Position[]> {
    const client = this.chain.getClient();

    const shares = await client.readContract({
      address: SHMON,
      abi: VAULT,
      functionName: 'balanceOf',
      args: [address],
    });
    if (shares === 0n) return [];

    const [assets, monUsd] = await Promise.all([
      client.readContract({
        address: SHMON,
        abi: VAULT,
        functionName: 'convertToAssets',
        args: [shares],
      }),
      this.pricing.getMonUsd(),
    ]);

    const sharesFormatted = formatUnits(shares, 18);
    const monFormatted = formatUnits(assets, 18);
    const valueUSD = monUsd === null ? null : Number(monFormatted) * monUsd;
    const exchangeRate = Number(assets) / Number(shares);

    const position: Position = {
      id: `shmonad:staking:${SHMON}`,
      protocol: 'shmonad',
      type: 'staking',
      label: 'shMON liquid staking',
      valueUSD,
      assets: [
        {
          symbol: 'shMON',
          address: SHMON,
          decimals: 18,
          amount: shares.toString(),
          amountFormatted: sharesFormatted,
          valueUSD,
        },
      ],
      rewards: [],
      metrics: {
        underlyingMON: monFormatted,
        exchangeRate: `1 shMON = ${exchangeRate.toFixed(4)} MON`,
      },
      risk: {
        level: 'safe',
        reason:
          'Liquid staking position — accrues MON value over time, with no loan or liquidation risk.',
      },
      raw: { shares: shares.toString(), assets: assets.toString() },
    };

    return [position];
  }
}
