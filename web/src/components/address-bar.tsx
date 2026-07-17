"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

const DEMOS: { label: string; address: string }[] = [
  { label: "shMON whale", address: "0xE43fF0bF1e0FD5eF576Fad9699812A470009fFC4" },
  { label: "Uniswap LP", address: "0xcbF323be43eF0f3A92eCBC0980f427cBa45f0866" },
];

export function AddressBar({ onSubmit }: { onSubmit: (address: string) => void }) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const valid = ADDRESS_RE.test(trimmed);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(trimmed);
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-stretch gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="0x… paste any Monad wallet address"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-panel px-3.5 py-2.5 font-mono text-sm text-bone outline-none transition-colors placeholder:text-faint focus:border-brand"
        />
        <Button
          type="submit"
          disabled={!valid}
          className="px-4 font-mono text-xs uppercase tracking-[0.2em]"
        >
          View
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          Try a demo:
        </span>
        {DEMOS.map((demo) => (
          <button
            key={demo.address}
            type="button"
            onClick={() => {
              setValue(demo.address);
              onSubmit(demo.address);
            }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-brand"
          >
            ↳ {demo.label}
          </button>
        ))}
      </div>
    </form>
  );
}
