import Link from "next/link";
import { ConnectButton } from "./connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-[52px] max-w-5xl items-center justify-between px-5 lg:h-[64px] lg:px-8">
        <span className="absolute inset-y-0 left-0 hidden w-[4px] bg-brand lg:block" />
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-heading text-xl font-extrabold uppercase tracking-tight text-bone"
          >
            adjacent
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-bone"
            >
              Portfolio
            </Link>
            <Link
              href="/campaigns"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-bone"
            >
              Campaigns
            </Link>
          </nav>
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
