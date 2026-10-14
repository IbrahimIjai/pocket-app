// Runtime config. EXPO_PUBLIC_* vars are inlined at bundle time — must be read as
// literal `process.env.EXPO_PUBLIC_X` expressions (no dynamic access).

export const config = {
  chainId: Number(process.env.EXPO_PUBLIC_CHAIN_ID ?? 143),
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL || 'https://rpc.monad.xyz',
  fallbackRpcUrl: process.env.EXPO_PUBLIC_FALLBACK_RPC || 'https://rpc.monad.xyz',
  perplApiUrl: process.env.EXPO_PUBLIC_PERPL_API_URL || 'https://app.perpl.xyz/api',
  perplWsUrl: process.env.EXPO_PUBLIC_PERPL_WS_URL || 'wss://app.perpl.xyz',
  perplExchange: (process.env.EXPO_PUBLIC_PERPL_EXCHANGE ||
    '0x34B6552d57a35a1D042CcAe1951BD1C370112a6F') as `0x${string}`,
  ausd: (process.env.EXPO_PUBLIC_AUSD ||
    '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a') as `0x${string}`,
  /** Passkey rpId (plan D10). Empty until the domain is chosen. */
  rpId: process.env.EXPO_PUBLIC_RP_ID ?? '',
} as const;
