"use client";

import { useState } from "react";
import type { Position } from "@adjacent/shared";
import { explainPosition } from "@/lib/api";

export function ExplainPanel({ position }: { position: Position }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    setOpen(true);
    if (text || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await explainPosition(position);
      setText(result.text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-hairline pt-3">
      {!open ? (
        <button
          type="button"
          onClick={handleExplain}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand transition-colors hover:text-bone"
        >
          ↳ Explain this
        </button>
      ) : (
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
            Explanation
          </div>
          {loading && (
            <p className="mt-1.5 animate-pulse text-xs text-steel">Thinking…</p>
          )}
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
          {text && (
            <p className="mt-1.5 text-xs leading-relaxed text-mid">{text}</p>
          )}
        </div>
      )}
    </div>
  );
}
