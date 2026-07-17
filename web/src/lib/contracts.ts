import { parseAbi } from "viem";
import { ADDRESSES, ERC4626_ABI, MONAD_MAINNET_CHAIN_ID } from "@adjacent/shared";

export const MONAD_CHAIN_ID = MONAD_MAINNET_CHAIN_ID;

export const SHMONAD_ADDRESS = ADDRESSES.shmonad as `0x${string}`;
export const SHMONAD_ABI = parseAbi(ERC4626_ABI);

/** Native MON to leave unspent for gas when using the MAX button. */
export const GAS_RESERVE_WEI = 100000000000000000n; // 0.1 MON

export const EXPLORER_TX = (hash: string) => `https://monadscan.com/tx/${hash}`;
