import { Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

type Props = {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

/** Selectable pill used for risk amounts and boldness on the ticket. */
export function Chip({ label, sublabel, selected, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={sublabel ? `${label} ${sublabel}` : label}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 flex-1 items-center justify-center rounded-2xl border px-2 py-2 ${
        selected ? 'border-pocket-mint bg-pocket-mint' : 'border-outline-200 bg-background-50'
      } ${disabled ? 'opacity-30' : ''}`}>
      <Text
        className={`font-inter-semibold text-base ${selected ? 'text-pocket-ink' : 'text-typography-900'}`}
        style={{ fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
      {sublabel && (
        <Text
          className={`font-inter text-xs ${selected ? 'text-pocket-ink' : 'text-typography-500'}`}>
          {sublabel}
        </Text>
      )}
    </Pressable>
  );
}
