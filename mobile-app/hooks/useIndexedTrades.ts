import { useQuery } from '@tanstack/react-query';
import { envioEnabled, fetchIndexedTrades } from '@/lib/envio';
import { useMarkets } from '@/hooks/useMarkets';

/** Closed/liquidated Perpl trades for `address` from the Envio indexer (empty if not configured). */
export function useIndexedTrades(address: string | null) {
  const { markets } = useMarkets();
  return useQuery({
    queryKey: ['envio-trades', address, markets.length],
    enabled: Boolean(address) && envioEnabled() && markets.length > 0,
    refetchInterval: 15_000,
    queryFn: () => fetchIndexedTrades(address!, markets),
  });
}
