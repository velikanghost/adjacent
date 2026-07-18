"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CampaignStatus } from "@adjacent/shared";
import { fetchCampaigns } from "@/lib/api";
import { CampaignCard } from "@/components/campaign-card";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value?: CampaignStatus }[] = [
  { label: "All" },
  { label: "Live", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ended", value: "ended" },
];

export default function CampaignsPage() {
  const [filter, setFilter] = useState<CampaignStatus | undefined>(undefined);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => fetchCampaigns(),
  });

  const campaigns = (data ?? []).filter((c) => !filter || c.status === filter);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-bone lg:text-4xl">
          Campaigns
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          Competitions, incentives, and quests running across the Monad
          ecosystem — jump straight in.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
              filter === f.value
                ? "bg-hairline-2 text-bone"
                : "text-steel hover:text-bone",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-lg border border-hairline bg-card" />
          <div className="h-56 animate-pulse rounded-lg border border-hairline bg-card" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-danger">Failed to load campaigns.</p>
      )}

      {data && campaigns.length === 0 && (
        <div className="rounded-lg border border-hairline bg-panel p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">
            No campaigns {filter ? `(${filter})` : "yet"}
          </p>
          <p className="mt-2 text-sm text-dim">
            Check back soon, or add one from the admin page.
          </p>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </main>
  );
}
