import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme/brand';

const HOLD_MS = 900;

type Props = {
  label: string;
  onComplete: () => void;
  variant?: 'up' | 'down';
  disabled?: boolean;
};

/**
 * Press-and-hold confirm. A fill sweeps across while held; releasing early resets it.
 * In Phase 3 the completion triggers the passkey prompt before signing.
 */
export function HoldButton({ label, onComplete, variant = 'up', disabled }: Props) {
  const progress = useSharedValue(0);
  const [holding, setHolding] = useState(false);
  const fillColor = variant === 'up' ? colors.mint : colors.coral;

  const start = () => {
    setHolding(true);
    progress.value = withTiming(
      1,
      { duration: HOLD_MS * (1 - progress.value), easing: Easing.linear },
      (finished) => {
        if (finished) {
          scheduleOnRN(onComplete);
          // Reset so a retry needs a full hold again.
          progress.value = withDelay(400, withTiming(0, { duration: 250 }));
        }
      }
    );
  };

  const release = () => {
    setHolding(false);
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
  };

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Press and hold to confirm"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={start}
      onPressOut={release}
      className={`h-16 overflow-hidden rounded-full border-2 bg-background-50 ${
        variant === 'up' ? 'border-pocket-mint' : 'border-pocket-coral'
      } ${disabled ? 'opacity-40' : ''}`}>
      <Animated.View
        className="absolute bottom-0 left-0 top-0"
        style={[{ backgroundColor: fillColor }, fill]}
      />
      <View className="flex-1 flex-row items-center justify-center gap-2">
        <Text className="font-inter-semibold text-base text-typography-900">
          {holding ? 'Keep holding…' : label}
        </Text>
        <Ionicons name="finger-print" size={22} color={fillColor} />
      </View>
    </Pressable>
  );
}
