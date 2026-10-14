import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

type Variant = 'primary' | 'up' | 'down' | 'secondary' | 'ghost';

const BG: Record<Variant, string> = {
  primary: 'bg-pocket-mint',
  up: 'bg-pocket-mint',
  down: 'bg-pocket-coral',
  secondary: 'bg-background-50 border border-outline-200',
  ghost: 'bg-transparent',
};

const FG: Record<Variant, string> = {
  primary: 'text-pocket-ink',
  up: 'text-pocket-ink',
  down: 'text-pocket-ink',
  secondary: 'text-typography-900',
  ghost: 'text-typography-500',
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function PocketButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  className = '',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80 ${BG[variant]} ${disabled ? 'opacity-40' : ''} ${className}`}>
      {icon && <View>{icon}</View>}
      <Text className={`font-inter-semibold text-base ${FG[variant]}`}>{label}</Text>
    </Pressable>
  );
}
