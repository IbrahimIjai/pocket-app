import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';

const SPLASH_DURATION_MS = 1200;

// Match the native splash while the app loads.
export default function SplashRoute() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/home'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-pocket-ink">
      <Image
        source={require('../assets/splash-icon.png')}
        accessibilityLabel="Pocket"
        resizeMode="contain"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}
