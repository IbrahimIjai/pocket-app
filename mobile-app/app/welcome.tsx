import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen } from '@/components/screen';
import { PocketButton } from '@/components/pocket-button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { useOptionalSession } from '@/lib/account/session';
import { useMode } from '@/lib/mode';

// S1 · Passkey account entry plus paper trading without an account.
export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const session = useOptionalSession();
  const { setMode } = useMode();
  const [entryError, setEntryError] = useState<string | null>(null);
  const busy = session?.status === 'unlocking';

  const enter = async (action: 'create' | 'signIn') => {
    setEntryError(null);
    if (!session) {
      setEntryError('Pocket accounts are not available yet. You can still try Demo mode.');
      return;
    }
    if (await (action === 'create' ? session.create() : session.signIn())) {
      setMode('live');
      router.replace('/home');
    }
  };

  const enterDemo = () => {
    setMode('demo');
    router.replace('/home');
  };

  return (
    <Screen>
      <View className="flex-1 justify-between pt-10">
        <View className="items-center">
          <Image
            source={
              theme.mode === 'dark'
                ? require('../assets/brand/pocket-wordmark-dark.png')
                : require('../assets/brand/pocket-wordmark-light.png')
            }
            accessibilityLabel="Pocket"
            resizeMode="contain"
            style={{ width: 200, height: 64 }}
          />
        </View>

        <View className="gap-4">
          <Text className="font-inter-bold text-[40px] leading-[46px] text-typography-900">
            Trade in dollars.{'\n'}
            <Text className="font-inter-bold text-[40px] leading-[46px] text-pocket-mint">
              Never lose more than you chose.
            </Text>
          </Text>
          <Text className="font-inter text-base leading-6 text-typography-500">
            Pick how much you&apos;re willing to lose. Pocket sizes the trade and that amount is the
            ceiling.
          </Text>
        </View>

        <View className="gap-3">
          <PocketButton
            label={busy ? 'Unlocking…' : 'Create my Pocket'}
            disabled={busy}
            onPress={() => void enter('create')}
            icon={<Ionicons name="finger-print" size={22} color={theme.brand.ink} />}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void enter('signIn')}
            disabled={busy}
            accessibilityState={{ disabled: busy }}
            className="h-12 items-center justify-center">
            <Text className="font-inter-medium text-base text-typography-900">
              I already have one
            </Text>
          </Pressable>
          {(entryError || session?.error) && (
            <Text
              accessibilityRole="alert"
              className="text-center font-inter text-sm text-typography-900">
              {entryError || session?.error}
            </Text>
          )}
          <PocketButton
            label="Try Demo with $1,000"
            variant="secondary"
            disabled={busy}
            onPress={enterDemo}
          />
          <View className="flex-row items-center justify-center gap-2 pt-2">
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.muted} />
            <Text className="font-inter text-sm text-typography-500">
              No seed phrase. No app holds your money.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
