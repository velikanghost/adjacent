/**
 * Format a raw base-unit bigint into a decimal string (like viem's
 * `formatUnits`), without pulling in a dependency. Pure.
 */
export function formatBaseUnits(amount: bigint, decimals: number): string {
  const negative = amount < 0n
  const abs = negative ? -amount : amount
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const fraction = abs % base

  if (fraction === 0n) {
    return `${negative ? '-' : ''}${whole.toString()}`
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${negative ? '-' : ''}${whole.toString()}.${fractionStr}`
}
