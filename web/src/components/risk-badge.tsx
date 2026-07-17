import type { RiskLevel } from "@adjacent/shared";
import { RISK_STYLES } from "@/lib/risk";
import { cn } from "@/lib/utils";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const style = RISK_STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
        style.tint,
        style.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
