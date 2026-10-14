import { Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Money } from '@/components/money';
import { RiskMeter } from '@/components/risk-meter';
import { Text } from '@/components/ui/text';
import { formatUsd } from '@/lib/format';
import { positionStats } from '@/lib/positions';
import type { Position } from '@/lib/types';
import { colors } from '@/theme/brand';

export function PositionCard({
  position,
  mark,
  onPress,
}: {
  position: Position;
  mark: number;
  onPress: () => void;
}) {
  const { pnl, meter } = positionStats(position, mark);
  const up = position.side === 'long';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${position.symbol} ${up ? 'Up' : 'Down'} trade, ${formatUsd(pnl, { sign: true })}`}
      onPress={onPress}
      className="gap-3 rounded-3xl border border-outline-200 bg-background-50 p-4 active:opacity-80">
      <View className="flex-row items-center gap-2">
        <Text className="font-inter-semibold text-base text-typography-900">{position.symbol}</Text>
        <View
          className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${up ? 'bg-pocket-mint/15' : 'bg-pocket-coral/15'}`}>
          <Feather
            name={up ? 'arrow-up-right' : 'arrow-down-right'}
            size={12}
            color={up ? colors.mint : colors.coral}
          />
          <Text
            className={`font-inter-medium text-xs ${up ? 'text-pocket-mint' : 'text-pocket-coral'}`}>
            {up ? 'Up' : 'Down'} · {position.k}×
          </Text>
        </View>
        <View className="flex-1" />
        <Text className="font-inter text-sm text-typography-500">
          {formatUsd(position.riskUsd, { cents: false })} risk
        </Text>
      </View>
      <Money value={pnl} sign tone className="font-inter-bold text-2xl" />
      <RiskMeter fractionLeft={meter.fractionLeft} level={meter.level} />
    </Pressable>
  );
}
