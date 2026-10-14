import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/ui/text';
import { shortAddress } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

/** Short address pill; tap copies the full address. */
export function CopyAddress({ address }: { address: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? 'Address copied' : 'Copy address'}
      onPress={async () => {
        await Clipboard.setStringAsync(address);
        setCopied(true);
      }}
      className="h-11 flex-row items-center gap-2 self-center rounded-full border border-outline-200 bg-background-50 px-4 active:opacity-80">
      <Text className="font-inter-medium text-base text-typography-900">
        {shortAddress(address)}
      </Text>
      <Feather
        name={copied ? 'check' : 'copy'}
        size={16}
        color={copied ? theme.brand.mint : theme.muted}
      />
    </Pressable>
  );
}
