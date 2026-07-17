import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, type PublicClient } from 'viem';
import { monadMainnet } from './monad.chain';

/**
 * Owns the single viem public client for Monad mainnet. Reads are batched
 * through Multicall3 (`batch.multicall`) to stay within public-RPC limits.
 */
@Injectable()
export class ChainService {
  private readonly client: PublicClient;

  constructor(config: ConfigService) {
    const rpcUrl = config.getOrThrow<string>('MONAD_RPC_URL');
    this.client = createPublicClient({
      chain: monadMainnet,
      transport: http(rpcUrl),
      batch: { multicall: true },
    });
  }

  getClient(): PublicClient {
    return this.client;
  }
}
