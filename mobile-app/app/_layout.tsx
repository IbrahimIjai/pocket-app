import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, themes } from '@/theme/brand';
import { useFonts } from 'expo-font';
import * as Splash from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import '../global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { QueryProvider } from '@/lib/query-client';
import { useColorScheme } from '@/hooks/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

Splash.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
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
  const mode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = themes[mode];
  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <QueryProvider>
      <GluestackUIProvider mode="system">
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <ThemeProvider
          value={{
            ...navigationTheme,
            colors: {
              ...navigationTheme.colors,
              primary: colors.mint,
              background: theme.background,
              card: theme.surface,
              text: theme.text,
              border: theme.border,
              notification: colors.coral,
            },
          }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: theme.background },
            }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="market/[symbol]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="trade/[symbol]"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="position/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="receipt/[id]"
              options={{ animation: 'fade', gestureEnabled: false }}
            />
          </Stack>
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryProvider>
  );
}
