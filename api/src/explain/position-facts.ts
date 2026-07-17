import type { Position } from '@adjacent/shared';

const usd = (value: number | null): string =>
  value === null ? 'unknown' : `$${value.toFixed(2)}`;

/** Trim a numeric string to a human-readable amount (max 4 fraction digits). */
export const short = (value: string | number): string => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
};

const isNumeric = (value: unknown): boolean => /^\d+\.?\d*$/.test(String(value));

/** IL value at a given relative price change, read off the position's curve. */
export function ilAt(position: Position, target: number): string | null {
  if (!position.ilCurve?.length) return null;
  const point = position.ilCurve.reduce((best, p) =>
    Math.abs(p.priceChange - target) < Math.abs(best.priceChange - target)
      ? p
      : best,
  );
  return `${(point.il * 100).toFixed(1)}%`;
}

/**
 * Compact, structured facts about a position — the ONLY numbers the LLM is
 * allowed to use. Every figure here was computed by us on-chain.
 */
export function positionFacts(position: Position): string {
  const lines: string[] = [
    `Protocol: ${position.protocol} (${position.type})`,
    `Label: ${position.label}`,
    `Value: ${usd(position.valueUSD)}`,
  ];

  if (position.assets.length > 0) {
    lines.push(
      'Holdings: ' +
        position.assets
          .map(
            (a) =>
              `${short(a.amountFormatted)} ${a.symbol}${a.valueUSD !== null ? ` (${usd(a.valueUSD)})` : ''}`,
          )
          .join(', '),
    );
  }

  if (position.rewards.length > 0) {
    lines.push(
      'Uncollected fees: ' +
        position.rewards
          .map((r) => `${short(r.amountFormatted)} ${r.symbol}`)
          .join(', '),
    );
  }

  for (const [key, value] of Object.entries(position.metrics)) {
    lines.push(`${key}: ${isNumeric(value) ? short(value) : value}`);
  }

  lines.push(`Risk level: ${position.risk.level} — ${position.risk.reason}`);

  const up = ilAt(position, 0.5);
  const down = ilAt(position, -0.5);
  if (up && down) {
    lines.push(
      `Impermanent loss vs holding: about ${up} if the price rises 50%, ${down} if it falls 50%`,
    );
  }

  return lines.join('\n');
}
