import { Text } from '@/components/ui/text';
import { formatUsd } from '@/lib/format';

type Props = {
  value: number;
  sign?: boolean;
  cents?: boolean;
  /** Colour by sign: mint for gains, coral for losses. */
  tone?: boolean;
  className?: string;
};

/** Dollar amount with tabular figures so digits don't jump while prices tick. */
export function Money({ value, sign, cents, tone, className = '' }: Props) {
  const color = tone
    ? value > 0
      ? 'text-pocket-mint'
      : value < 0
        ? 'text-pocket-coral'
        : 'text-typography-900'
    : 'text-typography-900';
  return (
    <Text className={`${color} ${className}`} style={{ fontVariant: ['tabular-nums'] }}>
      {formatUsd(value, { sign, cents })}
    </Text>
  );
}
