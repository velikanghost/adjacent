const WAD = 10n ** 18n

/**
 * Convert ERC-4626 vault shares to underlying assets given the vault's rate,
 * where `assetsPerShareWad = convertToAssets(1e18)`. Pure integer math.
 *
 * Prefer calling the vault's own `convertToAssets(shares)` on-chain when
 * possible; this helper is for client-side re-computation (e.g. a UI slider).
 */
export function sharesToAssets(shares: bigint, assetsPerShareWad: bigint): bigint {
  return (shares * assetsPerShareWad) / WAD
}
