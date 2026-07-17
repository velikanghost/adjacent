/** A 20-byte EVM address, hex-encoded with `0x` prefix. */
export type Address = `0x${string}`

/** Arbitrary hex-encoded bytes with `0x` prefix (e.g. a Pyth 32-byte feed id). */
export type Hex = `0x${string}`
