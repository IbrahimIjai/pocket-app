import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen } from '@/components/screen';
import { PocketButton } from '@/components/pocket-button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';

// S1 · Welcome. Phase 3 replaces the two handlers with Mera createPocket / signIn.
export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const enter = () => router.replace('/home');

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
            label="Create my Pocket"
            onPress={enter}
            icon={<Ionicons name="finger-print" size={22} color={theme.brand.ink} />}
          />
          <Pressable
            accessibilityRole="button"
            onPress={enter}
            className="h-12 items-center justify-center">
            <Text className="font-inter-medium text-base text-typography-900">
              I already have one
            </Text>
          </Pressable>
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
