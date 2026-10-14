import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { PriceChart } from '@/components/price-chart';
import { PocketButton } from '@/components/pocket-button';
import { Chip } from '@/components/chip';
import { AssetBadge } from '@/components/market-row';
import { Text } from '@/components/ui/text';
import { formatPct, formatPrice } from '@/lib/format';
import { TIMEFRAMES, type Timeframe } from '@/lib/perpl/market-data';
import { useMarket } from '@/hooks/useMarkets';
import { useCandles } from '@/hooks/useCandles';
import { useTheme } from '@/hooks/useTheme';

const CHART_HEIGHT = 220;

// S4 · Market — live mark price + Perpl candles.
export default function MarketScreen() {
  const { symbol = 'BTC' } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { market, isLoading } = useMarket(symbol);
  const [tf, setTf] = useState<Timeframe>('1D');
  const candles = useCandles(market?.marketId, market?.priceDecimals, tf);

  if (!market) {
    return (
      <Screen back title={symbol}>
        {isLoading ? (
          <ActivityIndicator className="mt-10" color={theme.brand.mint} />
        ) : (
          <Text className="font-inter text-typography-500">Unknown market “{symbol}”.</Text>
        )}
      </Screen>
    );
  }

  const up = market.change24hPct >= 0;
  const fundingSide = market.fundingPctPerHour >= 0 ? 'longs pay' : 'shorts pay';
  const trade = (side: 'long' | 'short') =>
    router.push({ pathname: '/trade/[symbol]', params: { symbol: market.symbol, side } });
  // Show today's live price as the last point so the chart and the header agree.
  const series = candles.data?.length ? [...candles.data, market.price] : [];

  return (
    <Screen
      back
      title={market.name}
      footer={
        <View className="flex-row gap-3">
          <PocketButton
            className="flex-1"
            variant="up"
            label="Up"
            icon={<Feather name="arrow-up-right" size={20} color={theme.brand.ink} />}
            onPress={() => trade('long')}
          />
          <PocketButton
            className="flex-1"
            variant="down"
            label="Down"
            icon={<Feather name="arrow-down-right" size={20} color={theme.brand.ink} />}
            onPress={() => trade('short')}
          />
        </View>
      }>
      <View className="gap-1 pt-2">
        <AssetBadge symbol={market.symbol} size={36} />
        <Text
          className="font-inter-bold text-4xl text-typography-900"
          style={{ fontVariant: ['tabular-nums'] }}>
          {formatPrice(market.price)}
        </Text>
        <Text
          className={`font-inter-medium text-base ${up ? 'text-pocket-mint' : 'text-pocket-coral'}`}>
          {formatPct(market.change24hPct)} today
        </Text>
      </View>

      <View className="-mx-5 mt-6" style={{ height: CHART_HEIGHT }}>
        {candles.isLoading ? (
          <ActivityIndicator className="mt-20" color={theme.brand.mint} />
        ) : series.length > 1 ? (
          <PriceChart data={series} height={CHART_HEIGHT} />
        ) : (
          <Text className="mt-20 text-center font-inter text-sm text-typography-500">
            {candles.isError
              ? 'Couldn’t load the chart. Try another timeframe.'
              : 'No chart data yet.'}
          </Text>
        )}
      </View>

      <View className="mt-4 flex-row gap-2">
        {(Object.keys(TIMEFRAMES) as Timeframe[]).map((t) => (
          <Chip key={t} label={t} selected={tf === t} onPress={() => setTf(t)} />
        ))}
      </View>

      <View className="mt-6 flex-row items-center gap-2 rounded-2xl border border-outline-200 bg-background-50 p-4">
        <Feather name="clock" size={16} color={theme.muted} />
        <Text className="flex-1 font-inter text-sm text-typography-500">
          Funding: {fundingSide}{' '}
          {formatPct(Math.abs(market.fundingPctPerHour), { sign: false, digits: 4 })}/h · up to{' '}
          {market.maxLeverage}×
        </Text>
      </View>
    </Screen>
  );
}
