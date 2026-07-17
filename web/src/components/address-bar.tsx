"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DEMO_ADDRESS = "0xE43fF0bF1e0FD5eF576Fad9699812A470009fFC4";

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
      <button
        type="button"
        onClick={() => {
          setValue(DEMO_ADDRESS);
          onSubmit(DEMO_ADDRESS);
        }}
        className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-steel transition-colors hover:text-brand"
      >
        ↳ Try a demo whale
      </button>
    </form>
  );
}
