import { defineChain } from 'viem';
import {
  ADDRESSES,
  MONAD_MAINNET_CHAIN_ID,
  MONAD_MAINNET_RPC,
} from '@adjacent/shared';

/**
 * Monad mainnet chain definition for viem. Multicall3 is the canonical
 * deployment (verified on-chain), enabling batched reads.
 */
export const monadMainnet = defineChain({
  id: MONAD_MAINNET_CHAIN_ID,
  name: 'Monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [MONAD_MAINNET_RPC] } },
  contracts: {
    multicall3: { address: ADDRESSES.multicall3 },
  },
});
