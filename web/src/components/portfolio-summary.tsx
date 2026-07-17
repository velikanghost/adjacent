import type { Portfolio } from "@adjacent/shared";
import { formatUsd, truncateAddress } from "@/lib/format";

export function PortfolioSummary({ portfolio }: { portfolio: Portfolio }) {
  const count = portfolio.positions.length;
  const updated = new Date(portfolio.generatedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="rounded-lg border border-hairline bg-panel p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
          Total value
        </span>
        <span className="font-mono text-[11px] text-steel">
          {truncateAddress(portfolio.address)}
        </span>
      </div>
      <div className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-bone lg:text-5xl">
        {formatUsd(portfolio.totalValueUSD)}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-dim">
        {count} position{count === 1 ? "" : "s"} · updated {updated}
      </div>
    </section>
  );
}
