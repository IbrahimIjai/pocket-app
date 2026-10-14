import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useMode } from '@/lib/mode';

/** Small pill so nobody mistakes demo money for real money. */
export function ModeBadge() {
  const { mode } = useMode();
  const demo = mode === 'demo';
  return (
    <View
      className={`rounded-full px-2.5 py-1 ${demo ? 'bg-pocket-amber/20' : 'bg-pocket-mint/20'}`}
      accessibilityLabel={demo ? 'Demo mode' : 'Live mode'}>
      <Text
        className={`font-inter-semibold text-xs ${demo ? 'text-pocket-amber' : 'text-pocket-mint'}`}>
        {demo ? 'DEMO' : 'LIVE'}
      </Text>
    </View>
  );
}

export function OfflineNote() {
  return (
    <View className="mt-3 rounded-2xl bg-pocket-amber/15 px-4 py-2">
      <Text className="font-inter text-xs text-pocket-amber">
        Can&apos;t reach Perpl — showing sample prices.
      </Text>
    </View>
  );
}
