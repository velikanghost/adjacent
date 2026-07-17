import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-[52px] max-w-5xl items-center justify-between px-5 lg:h-[64px] lg:px-8">
        <span className="absolute inset-y-0 left-0 hidden w-[4px] bg-brand lg:block" />
        <div className="flex items-baseline gap-3">
          <span className="font-heading text-xl font-extrabold uppercase tracking-tight text-bone">
            adjacent
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-steel sm:inline">
            Monad DeFi Copilot
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel sm:inline-flex">
            <span className="size-1.5 rounded-full bg-safe" />
            Mainnet
          </span>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
