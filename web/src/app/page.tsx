"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import type { PortfolioError } from "@adjacent/shared";
import { fetchPortfolio } from "@/lib/api";
import { AddressBar } from "@/components/address-bar";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { PositionCard } from "@/components/position-card";
import { StakePanel } from "@/components/stake-panel";

export default function Home() {
  const [address, setAddress] = useState("");
  const { address: connected, isConnected } = useAppKitAccount();

  // When a wallet connects, load its address automatically.
  useEffect(() => {
    if (isConnected && connected) setAddress(connected);
  }, [isConnected, connected]);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => fetchPortfolio(address),
    enabled: address.length > 0,
  });

  const showData = data && !isFetching;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-heading text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-bone lg:text-4xl">
            See every position.
            <br />
            Understand every risk.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            Paste any Monad wallet to discover its DeFi positions across the
            ecosystem — valued, risk-scored, and explained in plain English.
          </p>
        </div>

        <div className="mb-10 max-w-2xl">
          <AddressBar onSubmit={setAddress} />
        </div>

        {isConnected &&
          connected &&
          address.toLowerCase() === connected.toLowerCase() && (
            <div className="mb-8 max-w-2xl">
              <StakePanel address={connected as `0x${string}`} />
            </div>
          )}

        {address.length === 0 && <IdlePrompt />}
        {isFetching && <LoadingState />}
        {isError && <ErrorState message={(error as Error).message} />}

        {showData &&
          (data.positions.length === 0 ? (
            <NoPositions />
          ) : (
            <div className="space-y-6">
              <PortfolioSummary portfolio={data} />
              <div className="grid gap-4 md:grid-cols-2">
                {data.positions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
              {data.errors.length > 0 && <ErrorsNote errors={data.errors} />}
            </div>
          ))}
    </main>
  );
}

function IdlePrompt() {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
      Awaiting an address…
    </p>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-lg border border-hairline bg-panel" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-lg border border-hairline bg-card" />
        <div className="h-56 animate-pulse rounded-lg border border-hairline bg-card" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-danger">
        Failed to load
      </p>
      <p className="mt-1 text-sm text-steel">{message}</p>
    </div>
  );
}

function NoPositions() {
  return (
    <div className="rounded-lg border border-hairline bg-panel p-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">
        No supported positions found
      </p>
      <p className="mt-2 text-sm text-dim">
        We currently scan shMONAD staking. Uniswap v3 and Kuru are coming next.
      </p>
    </div>
  );
}

function ErrorsNote({ errors }: { errors: PortfolioError[] }) {
  return (
    <p className="font-mono text-[11px] text-dim">
      {errors.map((e) => `${e.protocol} unavailable`).join(" · ")}
    </p>
  );
}
