import type { Portfolio, Position } from "@adjacent/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5040";

/** Fetch the discovered, valued portfolio for an address from the api. */
export async function fetchPortfolio(address: string): Promise<Portfolio> {
  const res = await fetch(`${API_URL}/positions/${address}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<Portfolio>;
}

export interface Explanation {
  text: string;
  source: "cache" | "groq" | "template";
}

/** Request a plain-English explanation of a position from the api. */
export async function explainPosition(position: Position): Promise<Explanation> {
  const res = await fetch(`${API_URL}/explain`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(position),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<Explanation>;
}
