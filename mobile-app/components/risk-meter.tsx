import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import type { RiskLevel } from '@/lib/risk';

const LEVEL: Record<RiskLevel, { bar: string; text: string; label: string }> = {
  safe: { bar: 'bg-pocket-mint', text: 'text-pocket-mint', label: 'safe' },
  watch: { bar: 'bg-pocket-amber', text: 'text-pocket-amber', label: 'watch' },
  danger: { bar: 'bg-pocket-coral', text: 'text-pocket-coral', label: 'close to auto-close' },
};

type Props = {
  fractionLeft: number; // 0..1: distance left before auto-close
  level: RiskLevel;
  size?: 'sm' | 'lg';
  showLabel?: boolean;
};

/** Distance to auto-close: full bar = far away, empty = about to close. */
export function RiskMeter({ fractionLeft, level, size = 'sm', showLabel = true }: Props) {
  const width = useSharedValue(fractionLeft);

  useEffect(() => {
    width.value = withTiming(fractionLeft, { duration: 450 });
  }, [fractionLeft, width]);

  const fill = useAnimatedStyle(() => ({ width: `${Math.max(width.value, 0.02) * 100}%` }));
  const style = LEVEL[level];

  return (
    <View
      className="flex-row items-center gap-3"
      accessibilityLabel={`Risk meter: ${Math.round(fractionLeft * 100)}% of distance left, ${style.label}`}>
      <View
        className={`flex-1 overflow-hidden rounded-full bg-background-100 ${size === 'lg' ? 'h-3' : 'h-1.5'}`}>
        <Animated.View className={`h-full rounded-full ${style.bar}`} style={fill} />
      </View>
      {showLabel && (
        <Text
          className={`font-inter-medium ${size === 'lg' ? 'text-sm' : 'text-xs'} ${style.text}`}>
          {style.label}
        </Text>
      )}
    </View>
  );
}
