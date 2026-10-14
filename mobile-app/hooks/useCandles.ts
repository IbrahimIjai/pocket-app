import { useQuery } from '@tanstack/react-query';
import { TIMEFRAMES, getCandles, type Timeframe } from '@/lib/perpl/market-data';
import { scalePrice } from '@/lib/perpl/units';

/** Close prices for the chart, oldest first. */
export function useCandles(
  marketId: number | undefined,
  priceDecimals: number | undefined,
  tf: Timeframe
) {
  return useQuery({
    queryKey: ['perpl', 'candles', marketId, tf],
    enabled: marketId !== undefined && priceDecimals !== undefined,
    staleTime: 30_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { resolution, windowMs } = TIMEFRAMES[tf];
      const to = Date.now();
      const series = await getCandles(marketId!, resolution, to - windowMs, to);
      return series.d.map((c) => scalePrice(c.c, priceDecimals!));
    },
  });
}
