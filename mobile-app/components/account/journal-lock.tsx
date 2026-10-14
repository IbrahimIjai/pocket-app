import { ActivityIndicator, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { PocketButton } from '@/components/pocket-button';
import { Text } from '@/components/ui/text';
import { useJournal } from '@/lib/journal';
import { useTheme } from '@/hooks/useTheme';

/** Live-mode Activity header: the journal is sealed with a passkey vault (Mera PRF). */
export function JournalLock() {
  const journal = useJournal();
  const theme = useTheme();

  if (journal.status === 'unlocked') {
    return (
      <View className="mt-3 flex-row items-center gap-2 self-start rounded-full bg-pocket-mint/15 px-3 py-1.5">
        <Feather name="lock" size={12} color={theme.brand.mint} />
        <Text className="font-inter-medium text-xs text-pocket-mint">
          Encrypted on this phone with your passkey
        </Text>
      </View>
    );
  }

  const busy = journal.status === 'unlocking';
  return (
    <View className="mt-4 gap-3 rounded-3xl border border-outline-200 bg-background-50 p-5">
      <View className="flex-row items-center gap-2">
        <Feather name="lock" size={16} color={theme.text} />
        <Text className="font-inter-semibold text-base text-typography-900">
          Your history is encrypted
        </Text>
      </View>
      <Text className="font-inter text-sm leading-5 text-typography-500">
        Pocket seals your trade journal with a key that only your passkey can open. It&apos;s a
        separate key from your wallet, and it never leaves this phone.
      </Text>
      {journal.error && (
        <Text accessibilityRole="alert" className="font-inter text-sm text-pocket-coral">
          {journal.error}
        </Text>
      )}
      <PocketButton
        label={busy ? 'Unlocking…' : 'Unlock history'}
        disabled={busy}
        icon={busy ? <ActivityIndicator size="small" color={theme.brand.ink} /> : undefined}
        onPress={() => void journal.unlock()}
      />
    </View>
  );
}
