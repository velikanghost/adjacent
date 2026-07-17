"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  EXPLORER_TX,
  GAS_RESERVE_WEI,
  MONAD_CHAIN_ID,
  SHMONAD_ABI,
  SHMONAD_ADDRESS,
} from "@/lib/contracts";

function safeParseEther(value: string): bigint | null {
  try {
    if (!value.trim()) return null;
    return parseEther(value);
  } catch {
    return null;
  }
}

export function StakePanel({ address }: { address: `0x${string}` }) {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { chainId } = useAccount();

  const { data: balance } = useBalance({ address });
  const parsed = safeParseEther(amount);
  const monBalance = balance?.value ?? 0n;
  const insufficient = parsed !== null && parsed > monBalance;
  const wrongChain = chainId !== undefined && chainId !== MONAD_CHAIN_ID;

  const { data: previewShares } = useReadContract({
    address: SHMONAD_ADDRESS,
    abi: SHMONAD_ABI,
    functionName: "previewDeposit",
    args: parsed ? [parsed] : undefined,
    query: { enabled: parsed !== null && parsed > 0n },
  });

  const { writeContract, data: hash, isPending, error, reset } =
    useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    }
  }, [isSuccess, queryClient]);

  const canStake =
    parsed !== null &&
    parsed > 0n &&
    !insufficient &&
    !wrongChain &&
    !isPending &&
    !confirming;

  function handleMax() {
    const usable = monBalance > GAS_RESERVE_WEI ? monBalance - GAS_RESERVE_WEI : 0n;
    setAmount(formatEther(usable));
  }

  function handleStake() {
    if (!parsed) return;
    reset();
    writeContract({
      address: SHMONAD_ADDRESS,
      abi: SHMONAD_ABI,
      functionName: "deposit",
      args: [parsed, address],
      value: parsed,
    });
  }

  return (
    <section className="rounded-lg border border-hairline bg-panel p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-bone">
          Stake MON → shMON
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
          Bal {Number(formatEther(monBalance)).toLocaleString("en-US", { maximumFractionDigits: 4 })} MON
        </span>
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-hairline bg-card px-3">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm text-bone outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={handleMax}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel hover:text-brand"
          >
            Max
          </button>
        </div>
        <button
          type="button"
          onClick={handleStake}
          disabled={!canStake}
          className="rounded-md bg-brand px-4 font-mono text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Confirm…" : confirming ? "Staking…" : "Stake"}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
        <span className="text-steel">
          {previewShares !== undefined && parsed
            ? `≈ ${Number(formatEther(previewShares)).toLocaleString("en-US", { maximumFractionDigits: 4 })} shMON`
            : "You'll receive shMON"}
        </span>
        <span className="text-dim">gas paid in MON · 0.1 reserved</span>
      </div>

      {wrongChain && (
        <p className="mt-2 font-mono text-[11px] text-watch">
          Switch your wallet to Monad to stake.
        </p>
      )}
      {insufficient && (
        <p className="mt-2 font-mono text-[11px] text-danger">Insufficient MON balance.</p>
      )}
      {error && (
        <p className="mt-2 text-[11px] text-danger">
          {error.message.split("\n")[0]}
        </p>
      )}
      {isSuccess && hash && (
        <p className="mt-2 font-mono text-[11px] text-safe">
          Staked ·{" "}
          <a
            href={EXPLORER_TX(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-bone"
          >
            view tx
          </a>
        </p>
      )}
    </section>
  );
}
