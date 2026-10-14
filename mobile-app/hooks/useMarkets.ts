import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContext, getTicker, sortMarkets, toMarket } from '@/lib/perpl/market-data';
import { MOCK_MARKETS } from '@/lib/mock';
import type { Market } from '@/lib/types';

const PRICE_POLL_MS = 2_000;

/** Market config (5 min cache) merged with live prices (2s poll while the app is active). */
export function useMarkets() {
  const context = useQuery({
    queryKey: ['perpl', 'context'],
    queryFn: getContext,
    staleTime: 5 * 60_000,
  });
  const ticker = useQuery({
    queryKey: ['perpl', 'ticker'],
    queryFn: getTicker,
    refetchInterval: PRICE_POLL_MS,
    enabled: context.isSuccess,
  });

  const markets = useMemo<Market[]>(() => {
    if (!context.data) return [];
    return sortMarkets(
      context.data.markets
        .filter((m) => m.config.is_open)
        .map((m) => toMarket(m, ticker.data?.d[String(m.id)] ?? m.state))
    );
  }, [context.data, ticker.data]);

  // If Perpl is unreachable, keep the app usable with sample prices (flagged to the UI).
  const offline = context.isError && markets.length === 0;

  return {
    markets: offline ? MOCK_MARKETS : markets,
    isLoading: context.isLoading,
    offline,
    refetch: () => Promise.all([context.refetch(), ticker.refetch()]),
  };
}

export function useMarket(symbol: string | undefined) {
  const { markets, ...rest } = useMarkets();
  const market = markets.find((m) => m.symbol === symbol?.toUpperCase());
  return { market, ...rest };
}
