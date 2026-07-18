import type { Campaign, Portfolio, Position } from "@adjacent/shared";

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

/** Fetch campaigns, optionally filtered by status. */
export async function fetchCampaigns(status?: string): Promise<Campaign[]> {
  const url = new URL(`${API_URL}/campaigns`);
  if (status) url.searchParams.set("status", status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<Campaign[]>;
}

export interface CreateCampaignInput {
  title: string;
  protocols: string[];
  type: string;
  description: string;
  rewardSummary: string;
  startsAt: string;
  endsAt: string;
  url: string;
  imageUrl?: string;
  chainId: number;
}

/** Create a campaign (admin key required). */
export async function createCampaign(
  input: CreateCampaignInput,
  adminKey: string,
): Promise<Campaign> {
  const res = await fetch(`${API_URL}/campaigns`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<Campaign>;
}
