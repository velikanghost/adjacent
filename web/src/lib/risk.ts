import type { RiskLevel } from "@adjacent/shared";

interface RiskStyle {
  label: string;
  dot: string;
  text: string;
  tint: string;
  stripe: string;
}

export const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  safe: {
    label: "SAFE",
    dot: "bg-safe",
    text: "text-safe",
    tint: "bg-safe/10",
    stripe: "bg-safe",
  },
  watch: {
    label: "WATCH",
    dot: "bg-watch",
    text: "text-watch",
    tint: "bg-watch/10",
    stripe: "bg-watch",
  },
  danger: {
    label: "DANGER",
    dot: "bg-danger",
    text: "text-danger",
    tint: "bg-danger/10",
    stripe: "bg-danger",
  },
};
