import type { Campaign } from "@adjacent/shared";
import { CAMPAIGN_STATUS_STYLES, formatDateRange } from "@/lib/campaign";
import { humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const status = CAMPAIGN_STATUS_STYLES[campaign.status];
  const ended = campaign.status === "ended";

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border border-hairline bg-card p-5",
        ended && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
            status.tint,
            status.text,
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", status.dot, status.live && "animate-pulse")}
          />
          {status.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {humanize(campaign.type)}
        </span>
      </div>

      <h3 className="mt-3 font-heading text-lg font-bold uppercase leading-tight tracking-tight text-bone">
        {campaign.title}
      </h3>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {campaign.protocols.map((p) => (
          <span
            key={p}
            className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
          >
            {p}
          </span>
        ))}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
        {campaign.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
        <div>
          <div className="font-mono text-sm text-brand">{campaign.rewardSummary}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
            {formatDateRange(campaign.startsAt, campaign.endsAt)}
          </div>
        </div>
        <a
          href={campaign.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
            ended
              ? "border border-hairline text-dim"
              : "bg-brand text-white hover:opacity-90",
          )}
        >
          {ended ? "View" : "Enter →"}
        </a>
      </div>
    </article>
  );
}
