import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Address } from 'viem';
import type { Portfolio, PortfolioError, Position } from '@adjacent/shared';
import { PROTOCOL_CLIENTS } from '../protocols/protocol-clients.token';
import type { ProtocolClient } from '../protocols/protocol-client.interface';

/**
 * Orchestrates discovery across every registered protocol. A single protocol
 * failing does not fail the whole portfolio — it's surfaced under `errors`.
 */
@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    @Inject(PROTOCOL_CLIENTS) private readonly clients: ProtocolClient[],
  ) {}

  async getPortfolio(address: Address): Promise<Portfolio> {
    const settled = await Promise.allSettled(
      this.clients.map((client) => client.getPositions(address)),
    );

    const positions: Position[] = [];
    const errors: PortfolioError[] = [];

    settled.forEach((result, index) => {
      const client = this.clients[index];
      if (result.status === 'fulfilled') {
        positions.push(...result.value);
      } else {
        this.logger.error(`${client.id} discovery failed`, result.reason);
        errors.push({
          protocol: client.id,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error',
        });
      }
    });

    const known = positions.filter(
      (p): p is Position & { valueUSD: number } => p.valueUSD !== null,
    );
    const totalValueUSD =
      positions.length > 0 && known.length === 0
        ? null
        : known.reduce((sum, p) => sum + p.valueUSD, 0);

    return {
      address,
      totalValueUSD,
      positions,
      generatedAt: new Date().toISOString(),
      errors,
    };
  }
}
