import type { Address } from '../types/address'

export type ProtocolId = 'shmonad' | 'uniswap-v3' | 'kuru'

export type PositionType = 'staking' | 'lp' | 'lending' | 'perps'

export type RiskLevel = 'safe' | 'watch' | 'danger'

/** One point on an impermanent-loss curve: IL at a given relative price change. */
export interface IlCurvePoint {
  /** Relative price change of token0 vs token1 (fraction, e.g. 0.25 = +25%). */
  priceChange: number
  /** Impermanent loss vs. holding, as a fraction (≤ 0). */
  il: number
}

/**
 * A single token holding within a position. `amount` is the raw base-unit
 * value as a string (JSON-safe — never a bigint across the API boundary).
 */
export interface TokenAmount {
  symbol: string
  address: Address
  decimals: number
  amount: string
  amountFormatted: string
  valueUSD: number | null
}

/**
 * Protocol-agnostic representation of a DeFi position. Every adapter normalizes
 * its on-chain data into this shape so the UI and AI layer stay decoupled from
 * any one protocol.
 */
export interface Position {
  /** Stable id: `${protocol}:${type}:${ref}` */
  id: string
  protocol: ProtocolId
  type: PositionType
  label: string
  valueUSD: number | null
  assets: TokenAmount[]
  rewards: TokenAmount[]
  /** Protocol-specific extras (LTV, tick range, APR, exchange rate, …). */
  metrics: Record<string, string | number>
  risk: { level: RiskLevel; reason: string }
  /** Position-specific impermanent-loss curve (LP positions only). */
  ilCurve?: IlCurvePoint[]
  /** Untouched adapter data, forwarded to the AI explainer as context. */
  raw?: unknown
}

export interface PortfolioError {
  protocol: ProtocolId
  message: string
}

/** The full result of a discovery run for one address. */
export interface Portfolio {
  address: Address
  totalValueUSD: number | null
  positions: Position[]
  generatedAt: string
  errors: PortfolioError[]
}
