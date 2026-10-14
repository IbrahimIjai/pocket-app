import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Splash from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';

import '../global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useColorScheme } from '@/hooks/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

Splash.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) Splash.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode={(colorScheme ?? 'light') as 'light' | 'dark'}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </GluestackUIProvider>
  );
}
