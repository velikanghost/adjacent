/** Format a number as USD, or an em dash when unknown. */
export function formatUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a decimal token-amount string with thousands separators. */
export function formatToken(amount: string, maxFractionDigits = 4): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
}

/** 0x1234…abcd */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** camelCase → "Title Case" for metric labels. */
export function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}
