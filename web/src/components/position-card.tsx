import type { Position } from "@adjacent/shared";
import { RiskBadge } from "./risk-badge";
import { RISK_STYLES } from "@/lib/risk";
import { formatToken, formatUsd, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PositionCard({ position }: { position: Position }) {
  const risk = RISK_STYLES[position.risk.level];
  const metrics = Object.entries(position.metrics);

  return (
    <article className="relative overflow-hidden rounded-lg border border-hairline bg-card">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", risk.stripe)} />
      <div className="p-5 pl-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-bone">
              {position.label}
            </h3>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
              {position.protocol} · {position.type}
            </div>
          </div>
          <RiskBadge level={position.risk.level} />
        </header>

        <div className="mt-4 font-mono text-2xl text-bone">
          {formatUsd(position.valueUSD)}
        </div>

        <div className="mt-4 space-y-1.5">
          {position.assets.map((asset) => (
            <div
              key={`${asset.address}:${asset.symbol}`}
              className="flex items-center justify-between font-mono text-xs"
            >
              <span className="text-mid">
                {formatToken(asset.amountFormatted)} {asset.symbol}
              </span>
              <span className="text-steel">{formatUsd(asset.valueUSD)}</span>
            </div>
          ))}
        </div>

        {metrics.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline pt-3">
            {metrics.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                  {humanize(key)}
                </dt>
                <dd className="font-mono text-xs text-mid">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-4 text-xs leading-relaxed text-steel">
          {position.risk.reason}
        </p>
      </div>
    </article>
  );
}
