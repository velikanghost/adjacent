import type { Address, Position, ProtocolId } from '@adjacent/shared';

/**
 * A protocol integration. Read-only today (`getPositions`); write actions
 * (build/simulate transactions) will be added to this interface incrementally
 * without changing the discovery contract.
 */
export interface ProtocolClient {
  readonly id: ProtocolId;
  getPositions(address: Address): Promise<Position[]>;
}
