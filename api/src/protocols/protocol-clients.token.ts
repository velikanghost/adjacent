/**
 * DI token for the collected list of ProtocolClient implementations, so
 * PositionsService can iterate every protocol without knowing them by name.
 */
export const PROTOCOL_CLIENTS = Symbol('PROTOCOL_CLIENTS');
