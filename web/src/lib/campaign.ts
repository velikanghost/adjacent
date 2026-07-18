import type { CampaignStatus } from "@adjacent/shared";

interface StatusStyle {
  label: string;
  dot: string;
  text: string;
  tint: string;
  live?: boolean;
}

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, StatusStyle> = {
  live: { label: "LIVE", dot: "bg-safe", text: "text-safe", tint: "bg-safe/10", live: true },
  upcoming: { label: "UPCOMING", dot: "bg-watch", text: "text-watch", tint: "bg-watch/10" },
  ended: { label: "ENDED", dot: "bg-dim", text: "text-dim", tint: "bg-hairline-2" },
};

export function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return `${fmt(startsAt)} – ${fmt(endsAt)}`;
}
