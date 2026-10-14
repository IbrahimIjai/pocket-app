import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { PriceChart } from '@/components/price-chart';
import { PocketButton } from '@/components/pocket-button';
import { Chip } from '@/components/chip';
import { Text } from '@/components/ui/text';
import { formatPct, formatPrice } from '@/lib/format';
import { mockMarket, mockSeries } from '@/lib/mock';
import { useTheme } from '@/hooks/useTheme';

const TIMEFRAMES = ['1H', '1D', '1W', '1M'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];
const POINTS: Record<Timeframe, number> = { '1H': 30, '1D': 60, '1W': 90, '1M': 120 };

// S4 · Market. Phase 2 swaps mocks for useMarkets()/useCandles().
export default function MarketScreen() {
  const { symbol = 'BTC' } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const theme = useTheme();
  const market = mockMarket(symbol);
  const [tf, setTf] = useState<Timeframe>('1D');
  const series = useMemo(() => mockSeries(symbol, POINTS[tf]), [symbol, tf]);

  if (!market) {
    return (
      <Screen back title="Market">
        <Text className="font-inter text-typography-500">Unknown market “{symbol}”.</Text>
      </Screen>
    );
  }

  const up = market.change24hPct >= 0;
  const fundingSide = market.fundingPctPerHour >= 0 ? 'longs pay' : 'shorts pay';
  const trade = (side: 'long' | 'short') =>
    router.push({ pathname: '/trade/[symbol]', params: { symbol: market.symbol, side } });

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

      <View className="-mx-5 mt-6">
        <PriceChart data={series} height={220} />
      </View>

      <View className="mt-4 flex-row gap-2">
        {TIMEFRAMES.map((t) => (
          <Chip key={t} label={t} selected={tf === t} onPress={() => setTf(t)} />
        ))}
      </View>

      <View className="mt-6 flex-row items-center gap-2 rounded-2xl border border-outline-200 bg-background-50 p-4">
        <Feather name="clock" size={16} color={theme.muted} />
        <Text className="flex-1 font-inter text-sm text-typography-500">
          Funding: {fundingSide}{' '}
          {formatPct(Math.abs(market.fundingPctPerHour), { sign: false, digits: 3 })}/h
        </Text>
      </View>
    </Screen>
  );
}
