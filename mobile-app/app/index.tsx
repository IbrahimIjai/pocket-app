import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useOptionalSession } from '@/lib/account/session';

const SPLASH_DURATION_MS = 1200;

// Match the native splash while the app loads.
export default function SplashRoute() {
  const router = useRouter();
  const session = useOptionalSession();
  const status = session?.status ?? 'signedOut';

  useEffect(() => {
    if (status === 'unlocking') return;
    const timer = setTimeout(
      () => router.replace(status === 'ready' ? '/home' : '/welcome'),
      SPLASH_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [router, status]);

  return (
    <View className="flex-1 items-center justify-center bg-background-0">
      <Image
        source={require('../assets/splash-icon.png')}
        accessibilityLabel="Pocket"
        resizeMode="contain"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}
