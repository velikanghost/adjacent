import type { Portfolio } from "@adjacent/shared";

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
