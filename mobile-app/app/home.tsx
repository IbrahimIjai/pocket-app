import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="font-geist-bold text-3xl text-typography-900">Pocket</Text>
        <Text className="font-geist text-center text-base text-typography-500">
          Home screen. Start building here.
        </Text>
        <Link href="/about" asChild>
          <Pressable className="rounded-full bg-black px-6 py-3">
            <Text className="font-geist-medium text-white">About</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
