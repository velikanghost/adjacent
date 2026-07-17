import type { IlCurvePoint } from "@adjacent/shared";

const WIDTH = 240;
const HEIGHT = 44;
const PAD = 4;

/**
 * Renders a position's real, concentrated-liquidity impermanent-loss curve:
 * how the LP underperforms holding as the pair's price moves. The green dot
 * marks the position today (0% change → 0 loss).
 */
export function IlCurve({ points }: { points: IlCurvePoint[] }) {
  if (points.length < 2) return null;

  const minIl = Math.min(...points.map((p) => p.il), -1e-4);
  const changes = points.map((p) => p.priceChange);
  const minC = Math.min(...changes);
  const maxC = Math.max(...changes);

  const x = (c: number) => PAD + ((c - minC) / (maxC - minC)) * (WIDTH - 2 * PAD);
  const y = (il: number) => {
    const raw = PAD + (il / minIl) * (HEIGHT - 2 * PAD);
    return Math.max(0, Math.min(HEIGHT, raw));
  };

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.priceChange).toFixed(1)},${y(p.il).toFixed(1)}`)
    .join(" ");

  const closestTo = (target: number) =>
    points.reduce((best, p) =>
      Math.abs(p.priceChange - target) < Math.abs(best.priceChange - target) ? p : best,
    );
  const at50 = closestTo(0.5);
  const current = closestTo(0);

  return (
    <div className="mt-4 border-t border-hairline pt-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
          Impermanent loss
        </span>
        <span className="font-mono text-[10px] text-steel">
          ≈ {(at50.il * 100).toFixed(1)}% at +50%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 h-11 w-full text-steel"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={x(current.priceChange)} cy={y(current.il)} r={2.5} className="fill-safe" />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-faint">
        <span>{(minC * 100).toFixed(0)}%</span>
        <span>price →</span>
        <span>+{(maxC * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
