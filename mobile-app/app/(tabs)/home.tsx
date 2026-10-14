import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Money } from '@/components/money';
import { MarketRow } from '@/components/market-row';
import { PositionCard } from '@/components/position-card';
import { Text } from '@/components/ui/text';
import { MOCK_BALANCES, MOCK_MARKETS, MOCK_POSITIONS, mockMarket } from '@/lib/mock';
import { positionStats } from '@/lib/positions';
import { useTheme } from '@/hooks/useTheme';

// S3 · Home. Phase 4 swaps balances for useBalances(), Phase 6 positions for chain reads.
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const positions = MOCK_POSITIONS.map((p) => ({
    position: p,
    mark: mockMarket(p.symbol)?.price ?? p.entryPrice,
  }));
  const uPnl = positions.reduce(
    (sum, { position, mark }) => sum + positionStats(position, mark).pnl,
    0
  );

  return (
    <Screen scroll tabBarSpace>
      <View className="h-12 flex-row items-center justify-between">
        <Image
          source={
            theme.mode === 'dark'
              ? require('../../assets/brand/pocket-wordmark-dark.png')
              : require('../../assets/brand/pocket-wordmark-light.png')
          }
          accessibilityLabel="Pocket"
          resizeMode="contain"
          style={{ width: 104, height: 32 }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={12}
          onPress={() => router.navigate('/you')}
          className="h-10 w-10 items-center justify-center rounded-full bg-background-50">
          <Feather name="settings" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View className="mt-6 gap-1">
        <Text className="font-inter-medium text-sm text-typography-500">Your Pocket</Text>
        <Money
          value={MOCK_BALANCES.pocketUsd}
          className="font-inter-bold text-5xl leading-[56px]"
        />
        <View className="flex-row items-center gap-2">
          <Money
            value={MOCK_BALANCES.inTradesUsd}
            className="font-inter-medium text-base text-typography-500"
          />
          <Text className="font-inter text-base text-typography-500">in trades</Text>
          <Money value={uPnl} sign tone className="font-inter-medium text-base" />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/add')}
        className="mt-5 h-11 flex-row items-center justify-center gap-2 self-start rounded-full border border-outline-200 bg-background-50 px-5 active:opacity-80">
        <Feather name="plus" size={16} color={theme.text} />
        <Text className="font-inter-semibold text-sm text-typography-900">Add dollars</Text>
      </Pressable>

      {positions.length > 0 && (
        <View className="mt-8 gap-3">
          <Text className="font-inter-semibold text-lg text-typography-900">Open trades</Text>
          {positions.map(({ position, mark }) => (
            <PositionCard
              key={position.id}
              position={position}
              mark={mark}
              onPress={() =>
                router.push({ pathname: '/position/[id]', params: { id: position.id } })
              }
            />
          ))}
        </View>
      )}

      <View className="mt-8">
        <Text className="mb-1 font-inter-semibold text-lg text-typography-900">Markets</Text>
        {MOCK_MARKETS.map((m) => (
          <MarketRow
            key={m.symbol}
            market={m}
            onPress={() =>
              router.push({ pathname: '/market/[symbol]', params: { symbol: m.symbol } })
            }
          />
        ))}
      </View>
    </Screen>
  );
}
