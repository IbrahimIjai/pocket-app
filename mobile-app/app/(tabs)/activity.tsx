import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Money } from '@/components/money';
import { AssetBadge } from '@/components/market-row';
import { Text } from '@/components/ui/text';
import { formatUsd, timeAgo } from '@/lib/format';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { Trade } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';
import { JournalLock } from '@/components/account/journal-lock';

// S8 · Activity. Phase 6 reads from lib/journal.ts; Phase 8 from Envio.
export default function ActivityScreen() {
  const theme = useTheme();
  const { mode, trades, signedIn } = usePortfolio();

  return (
    <Screen scroll tabBarSpace>
      <Text className="mt-4 font-inter-bold text-3xl text-typography-900">Activity</Text>
      {mode === 'live' && signedIn && <JournalLock />}
      {trades.length === 0 ? (
        <View className="mt-24 items-center gap-3">
          <Feather name="activity" size={28} color={theme.muted} />
          <Text className="font-inter text-base text-typography-500">
            {mode === 'demo'
              ? 'Your closed demo trades will show up here.'
              : 'Your closed trades will show up here.'}
          </Text>
        </View>
      ) : (
        <View className="mt-4">
          {trades.map((t, i) => (
            <TradeRow key={t.id} trade={t} divider={i > 0} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function TradeRow({ trade, divider }: { trade: Trade; divider: boolean }) {
  const up = trade.side === 'long';
  return (
    <View
      className={`flex-row items-center gap-3 py-4 ${divider ? 'border-t border-outline-200' : ''}`}>
      <AssetBadge symbol={trade.symbol} />
      <View className="flex-1">
        <Text className="font-inter-semibold text-base text-typography-900">
          {trade.symbol} {up ? 'Up' : 'Down'} · {trade.k}×
        </Text>
        <Text className="font-inter text-sm text-typography-500">
          {formatUsd(trade.riskUsd, { cents: false })} risk · {timeAgo(trade.closedAt)}
          {trade.autoClosed ? ' · auto-closed' : ''}
        </Text>
      </View>
      <Money value={trade.pnlUsd} sign tone className="font-inter-semibold text-base" />
    </View>
  );
}
