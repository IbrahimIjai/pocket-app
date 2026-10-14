import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PocketButton } from '@/components/pocket-button';
import { Text } from '@/components/ui/text';
import { useOptionalSession } from '@/lib/account/session';
import { useTheme } from '@/hooks/useTheme';

/** Live mode without a session: unlock (or create) the passkey account. */
export function UnlockCard() {
  const session = useOptionalSession();
  const theme = useTheme();
  const busy = session?.status === 'unlocking';

  return (
    <View className="mt-6 gap-3 rounded-3xl border border-outline-200 bg-background-50 p-5">
      <Text className="font-inter-semibold text-lg text-typography-900">Unlock your Pocket</Text>
      <Text className="font-inter text-sm leading-5 text-typography-500">
        Live trading uses your passkey account. Your keys never leave this phone.
      </Text>
      {session?.error && (
        <Text accessibilityRole="alert" className="font-inter text-sm text-pocket-coral">
          {session.error}
        </Text>
      )}
      <PocketButton
        label={busy ? 'Unlocking…' : 'Unlock with Face ID'}
        disabled={busy || !session}
        onPress={() => void session?.signIn()}
        icon={<Ionicons name="finger-print" size={20} color={theme.brand.ink} />}
      />
      <PocketButton
        variant="ghost"
        label="Create a new Pocket"
        disabled={busy || !session}
        onPress={() => void session?.create()}
      />
    </View>
  );
}
