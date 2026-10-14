import { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { useRouter } from 'expo-router';

const SPLASH_DURATION_MS = 1200;

// Blank splash — swap in branding here later.
export default function SplashRoute() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/home'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    </View>
  );
}
