import { createPublicClient, createWalletClient, fallback, http, type LocalAccount } from 'viem';
import { monad } from 'viem/chains';
import { config } from './config';

if (config.chainId !== monad.id) {
  throw new Error('Pocket requires Monad mainnet (chain 143).');
}

function rpcTransport() {
  const urls = [...new Set([config.rpcUrl, config.fallbackRpcUrl])];
  for (const url of urls) {
    if (!/^https?:\/\//.test(url)) throw new Error('Pocket RPC must be an HTTP(S) URL.');
  }
  return fallback(urls.map((url) => http(url, { timeout: 15_000, retryCount: 1 })));
}

export const publicClient = createPublicClient({ chain: monad, transport: rpcTransport() });

export function pocketWalletClient(account: LocalAccount) {
  return createWalletClient({ account, chain: monad, transport: rpcTransport() });
}

export type PocketWalletClient = ReturnType<typeof pocketWalletClient>;
