import { View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="font-geist-bold text-3xl text-typography-900">About</Text>
        <Text className="text-center font-geist text-base text-typography-500">
          Pocket v{version}
        </Text>
      </View>
    </SafeAreaView>
  );
}
