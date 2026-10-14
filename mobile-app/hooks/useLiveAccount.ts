import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { cnsToUsd, readAccount, readPositions, readWallet } from '@/lib/perpl/exchange';
import type { ChainPosition } from '@/lib/perpl/exchange';
import type { Market, Multiplier, Position } from '@/lib/types';
import { useMarkets } from '@/hooks/useMarkets';

const POLL_MS = 3_000;

/** Wallet AUSD/MON + Perpl account for a signed-in address. Disabled when `address` is null. */
export function useLiveAccount(address: Address | null) {
  const { markets } = useMarkets();
  const perpIds = markets.map((m) => m.marketId);

  return useQuery({
    queryKey: ['live-account', address, perpIds.join(',')],
    enabled: Boolean(address) && perpIds.length > 0,
    refetchInterval: POLL_MS,
    queryFn: async () => {
      const addr = address!;
      const [wallet, account] = await Promise.all([readWallet(addr), readAccount(addr)]);
      const chainPositions = account ? await readPositions(account.accountId, perpIds) : [];
      return {
        walletUsd: cnsToUsd(wallet.ausd),
        usdcUsd: cnsToUsd(wallet.usdc), // USDC on Monad (e.g. from Aurora any-chain deposits)
        mon: Number(wallet.mon) / 1e18,
        accountId: account?.accountId ?? null,
        freeUsd: account ? cnsToUsd(account.balanceCNS) : 0,
        positions: chainPositions
          .map((p) => toPosition(p, markets))
          .filter((p): p is Position => p !== null),
      };
    },
  });
}

const MULTIPLIERS: Multiplier[] = [2, 5, 10];

function toPosition(p: ChainPosition, markets: Market[]): Position | null {
  const m = markets.find((x) => x.marketId === p.perpId);
  if (!m || m.priceDecimals === undefined || m.sizeDecimals === undefined) return null;
  const entry = Number(p.pricePNS) / 10 ** m.priceDecimals;
  const size = Number(p.lotLNS) / 10 ** m.sizeDecimals;
  const deposit = cnsToUsd(p.depositCNS);
  const notional = entry * size;
  const leverage = deposit > 0 ? notional / deposit : 1;
  const k = MULTIPLIERS.reduce((best, x) =>
    Math.abs(x - leverage) < Math.abs(best - leverage) ? x : best
  );
  // Same formula as lib/risk.ts, using the real deposit/notional ratio from chain.
  const dist = Math.max(deposit / notional - m.mmr, 0);
  return {
    id: `live-${p.perpId}`,
    symbol: m.symbol,
    side: p.side,
    k,
    riskUsd: deposit,
    entryPrice: entry,
    size,
    autoClosePrice: p.side === 'long' ? entry * (1 - dist) : entry * (1 + dist),
    openedAt: Date.now(),
  };
}
