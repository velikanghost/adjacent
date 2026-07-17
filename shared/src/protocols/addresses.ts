import type { Address, Hex } from '../types/address'

export const MONAD_MAINNET_CHAIN_ID = 143
export const MONAD_MAINNET_RPC = 'https://rpc.monad.xyz'

/**
 * Verified Monad **mainnet** addresses (checked on-chain via eth_getCode /
 * cast on 2026-07-16, chain id 143). Source of truth for anything not below:
 * https://github.com/monad-crypto/protocols (mainnet/*.jsonc).
 */
export const ADDRESSES = {
  multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
  wmon: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
  usdc: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
  usdt: '0xe7cd86e13AC4309349F30B3435a9d337750fC82D',
  weth: '0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242',
  wbtc: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
  /** ERC-4626 `asset()` sentinel meaning the underlying is native MON. */
  nativeSentinel: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  shmonad: '0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c',
  uniswapV3: {
    factory: '0x204faca1764b154221e35c0d20abb3c525710498',
    positionManager: '0x7197e214c0b767cfb76fb734ab638e2c192f4e53',
    quoterV2: '0x661e93cca42afacb172121ef892830ca3b70f08d',
  },
  pyth: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  kuru: {
    router: '0xd651346d7c789536ebf06dc72aE3C8502cd695CC',
    marginAccount: '0x2A68ba1833cDf93fa9Da1EEbd7F46242aD8E90c5',
  },
} as const satisfies Record<string, unknown>

/**
 * Pyth 32-byte feed ids (pull oracle at ADDRESSES.pyth). Read via
 * `getPriceUnsafe(bytes32)`; USD value = price * 10^expo.
 * Note: shMON→MON uses the shMONAD vault's `convertToAssets`, NOT a Pyth feed
 * (the SMON_MON_RR feed disagreed with the vault on 2026-07-16).
 */
export const PYTH_FEED_IDS = {
  MON_USD: '0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1',
  USDC_USD:
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  USDT_USD:
    '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  WETH_USD:
    '0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6',
  WBTC_USD:
    '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
} as const satisfies Record<string, Hex>

/** Map a token address (lowercased) to its Pyth USD feed id, when known. */
export const TOKEN_TO_PYTH_FEED: Record<string, Hex> = {
  [ADDRESSES.wmon.toLowerCase()]: PYTH_FEED_IDS.MON_USD,
  [ADDRESSES.usdc.toLowerCase()]: PYTH_FEED_IDS.USDC_USD,
  [ADDRESSES.usdt.toLowerCase()]: PYTH_FEED_IDS.USDT_USD,
  [ADDRESSES.weth.toLowerCase()]: PYTH_FEED_IDS.WETH_USD,
  [ADDRESSES.wbtc.toLowerCase()]: PYTH_FEED_IDS.WBTC_USD,
}
