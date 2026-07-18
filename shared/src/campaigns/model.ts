export type CampaignType = 'trading' | 'lp-incentive' | 'quest' | 'airdrop'

export type CampaignStatus = 'upcoming' | 'live' | 'ended'

export interface Campaign {
  id: string
  title: string
  /** Protocol slugs this campaign runs on, e.g. ['kuru', 'perpl']. */
  protocols: string[]
  type: CampaignType
  description: string
  /** Human-readable prize/reward, e.g. "$50k prize pool". */
  rewardSummary: string
  startsAt: string // ISO 8601
  endsAt: string // ISO 8601
  url: string
  imageUrl?: string
  chainId: number
  /** Derived from startsAt/endsAt at read time. */
  status: CampaignStatus
  createdAt: string
}

/** Derive a campaign's status from its window. */
export function computeCampaignStatus(
  startsAt: string,
  endsAt: string,
  now: number = Date.now(),
): CampaignStatus {
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  if (Number.isFinite(start) && now < start) return 'upcoming'
  if (Number.isFinite(end) && now > end) return 'ended'
  return 'live'
}
