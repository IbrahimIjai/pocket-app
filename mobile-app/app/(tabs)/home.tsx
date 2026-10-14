import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-pocket-ink">
      <View className="flex-1 items-center justify-center gap-6 px-6 pb-24">
        <Image
          source={require('../../assets/brand/pocket-wordmark-dark.png')}
          accessibilityLabel="Pocket"
          resizeMode="contain"
          style={{ width: 280, height: 88 }}
        />
        <Text className="font-inter-bold text-3xl text-typography-900">Pocket</Text>
        <Text className="text-center font-inter text-base text-typography-500">
          Trade in dollars. Never lose more than you chose.
        </Text>
      </View>
    </SafeAreaView>
  );
}
