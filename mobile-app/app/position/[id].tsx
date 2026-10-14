import { useEffect } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Money } from '@/components/money';
import { ModeBadge } from '@/components/mode-badge';
import { PocketButton } from '@/components/pocket-button';
import { RiskMeter } from '@/components/risk-meter';
import { Text } from '@/components/ui/text';
import { EXPLORER_TX, formatPct, formatPrice, shortAddress, timeAgo } from '@/lib/format';
import { positionStats } from '@/lib/positions';
import { BOLDNESS } from '@/lib/risk';
import { useDemo } from '@/lib/demo';
import type { Trade } from '@/lib/types';
import { useMarket } from '@/hooks/useMarkets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTheme } from '@/hooks/useTheme';

function receiptParams(t: Trade) {
  return {
    id: t.id,
    symbol: t.symbol,
    pnl: t.pnlUsd.toFixed(2),
    risk: String(t.riskUsd),
    settleMs: String(t.settleMs ?? 0),
    autoClosed: t.autoClosed ? '1' : '0',
    demo: t.demo ? '1' : '0',
  };
}

// S6 · Live trade — live mark price; demo positions settle locally, live ones on Perpl (Phase 6).
export default function LiveTradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { positions, trades } = usePortfolio();
  const demo = useDemo();
  const position = positions.find((p) => p.id === id);
  const { market } = useMarket(position?.symbol);

  // If it auto-closed while we were watching, show the receipt.
  const closedTrade = position ? undefined : trades.find((t) => t.id === id);
  useEffect(() => {
    if (closedTrade) {
      router.replace({ pathname: '/receipt/[id]', params: receiptParams(closedTrade) });
    }
  }, [closedTrade, router]);

  if (!position) {
    return (
      <Screen back title="Trade">
        <Text className="font-inter text-typography-500">This trade isn&apos;t open anymore.</Text>
      </Screen>
    );
  }

  const mark = market?.price ?? position.entryPrice;
  const { pnl, pnlPctOfRisk, meter } = positionStats(position, mark);
  const boldness = BOLDNESS.find((b) => b.k === position.k)?.label ?? '';
  const sideLabel = position.side === 'long' ? 'Up' : 'Down';

  const close = () => {
    const trade = demo.close(position.id);
    if (trade) router.replace({ pathname: '/receipt/[id]', params: receiptParams(trade) });
  };

  return (
    <Screen
      back
      title={`${position.symbol} ${sideLabel} · ${boldness} ${position.k}×`}
      right={<ModeBadge />}
      footer={<PocketButton variant="secondary" label="Close trade" onPress={close} />}>
      <View className="mt-6 gap-1">
        <Money value={pnl} sign tone className="font-inter-bold text-6xl leading-[68px]" />
        <Text className="font-inter-medium text-base text-typography-500">
          {formatPct(pnlPctOfRisk)} on your ${position.riskUsd}
        </Text>
      </View>

      <View className="mt-10 gap-4 rounded-3xl border border-outline-200 bg-background-50 p-5">
        <View className="flex-row justify-between">
          <Text className="font-inter text-base text-typography-500">Auto-close at</Text>
          <Text
            className="font-inter-semibold text-base text-typography-900"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatPrice(position.autoClosePrice)}
          </Text>
        </View>
        <RiskMeter fractionLeft={meter.fractionLeft} level={meter.level} size="lg" />
        <View className="flex-row justify-between">
          <Text className="font-inter text-base text-typography-500">Price now</Text>
          <Text
            className="font-inter-semibold text-base text-typography-900"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatPrice(mark)}
          </Text>
        </View>
      </View>

      <View className="mt-6 gap-3">
        <Text className="font-inter text-sm text-typography-500">
          Opened {timeAgo(position.openedAt)} at {formatPrice(position.entryPrice)}
        </Text>
        {position.openTx && (
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(EXPLORER_TX(position.openTx!))}
            className="flex-row items-center gap-1 self-start">
            <Text className="font-inter-medium text-sm text-pocket-violet">
              tx {shortAddress(position.openTx)} on MonadVision
            </Text>
            <Feather name="arrow-up-right" size={14} color={theme.brand.violet} />
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
