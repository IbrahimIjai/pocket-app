import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Money } from '@/components/money';
import { MarketRow } from '@/components/market-row';
import { ModeBadge, OfflineNote } from '@/components/mode-badge';
import { PositionCard } from '@/components/position-card';
import { Text } from '@/components/ui/text';
import { positionStats } from '@/lib/positions';
import { useMarkets } from '@/hooks/useMarkets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTheme } from '@/hooks/useTheme';
import { UnlockCard } from '@/components/account/unlock-card';
import { useOptionalSession } from '@/lib/account/session';
import { withdrawAll } from '@/lib/perpl/trade';
import { formatUsd } from '@/lib/format';
import { useState } from 'react';

// S3 · Home: live prices (Phase 2) + demo/live portfolio.
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { markets, isLoading, offline, refetch } = useMarkets();
  const { mode, balances, positions, signedIn, readyOnPerplUsd } = usePortfolio();
  const session = useOptionalSession();
  const [moving, setMoving] = useState(false);
  const moveBack = async () => {
    if (!session?.walletClient || !session.address) return;
    setMoving(true);
    try {
      await withdrawAll({ wallet: session.walletClient, address: session.address });
    } catch {
      // Perpl rate-limits withdrawals; the button stays so the user can retry.
    } finally {
      setMoving(false);
    }
  };

  const priced = positions.map((p) => ({
    position: p,
    mark: markets.find((m) => m.symbol === p.symbol)?.price ?? p.entryPrice,
  }));
  const uPnl = priced.reduce(
    (sum, { position, mark }) => sum + positionStats(position, mark).pnl,
    0
  );

  return (
    <Screen scroll tabBarSpace onRefresh={refetch}>
      <View className="h-12 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
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
          <ModeBadge />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={12}
          onPress={() => router.navigate('/you')}
          className="h-10 w-10 items-center justify-center rounded-full bg-background-50">
          <Feather name="settings" size={18} color={theme.text} />
        </Pressable>
      </View>
      {offline && <OfflineNote />}

      <View className="mt-6 gap-1">
        <Text className="font-inter-medium text-sm text-typography-500">
          {mode === 'demo' ? 'Demo Pocket' : 'Your Pocket'}
        </Text>
        <Money value={balances.pocketUsd} className="font-inter-bold text-5xl leading-[56px]" />
        <View className="flex-row items-center gap-2">
          <Money
            value={balances.inTradesUsd}
            className="font-inter-medium text-base text-typography-500"
          />
          <Text className="font-inter text-base text-typography-500">in trades</Text>
          {positions.length > 0 && (
            <Money value={uPnl} sign tone className="font-inter-medium text-base" />
          )}
        </View>
      </View>

      {mode === 'live' && !signedIn && <UnlockCard />}

      {mode === 'live' && signedIn && readyOnPerplUsd >= 0.01 && (
        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-outline-200 bg-background-50 px-4 py-3">
          <Text className="flex-1 font-inter text-sm text-typography-500">
            {formatUsd(readyOnPerplUsd)} free on Perpl (not at risk)
          </Text>
          <Pressable accessibilityRole="button" disabled={moving} onPress={() => void moveBack()}>
            <Text className="font-inter-semibold text-sm text-pocket-violet">
              {moving ? 'Moving…' : 'Move to Pocket'}
            </Text>
          </Pressable>
        </View>
      )}

      {mode === 'live' && signedIn && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/add')}
          className="mt-5 h-11 flex-row items-center justify-center gap-2 self-start rounded-full border border-outline-200 bg-background-50 px-5 active:opacity-80">
          <Feather name="plus" size={16} color={theme.text} />
          <Text className="font-inter-semibold text-sm text-typography-900">Add dollars</Text>
        </Pressable>
      )}

      {priced.length === 0 && (mode === 'demo' || signedIn) && (
        <View className="mt-8 flex-row items-center gap-3 rounded-3xl border border-outline-200 bg-background-50 p-4">
          <Feather
            name={mode === 'demo' ? 'play-circle' : 'lock'}
            size={22}
            color={mode === 'demo' ? theme.brand.mint : theme.muted}
          />
          <Text className="flex-1 font-inter text-sm leading-5 text-typography-500">
            {mode === 'demo'
              ? 'Try it: pick a market below, choose $5 and hold to trade. Demo money, live prices.'
              : 'Add AUSD and a little MON, then pick a market below.'}
          </Text>
        </View>
      )}

      {priced.length > 0 && (
        <View className="mt-8 gap-3">
          <Text className="font-inter-semibold text-lg text-typography-900">Open trades</Text>
          {priced.map(({ position, mark }) => (
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
        {isLoading ? (
          <ActivityIndicator className="mt-6" color={theme.brand.mint} />
        ) : (
          markets.map((m) => (
            <MarketRow
              key={m.symbol}
              market={m}
              onPress={() =>
                router.push({ pathname: '/market/[symbol]', params: { symbol: m.symbol } })
              }
            />
          ))
        )}
      </View>
    </Screen>
  );
}
