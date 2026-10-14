import React from 'react';
import { View, type ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import { useColorScheme } from '@/hooks/useColorScheme';
import { themes } from '@/theme/brand';
import { config } from './config';

export function GluestackUIProvider({
  mode = 'system',
  style,
  children,
  ...props
}: ViewProps & { mode?: 'system' | 'light' | 'dark' }) {
  const systemMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const resolvedMode = mode === 'system' ? systemMode : mode;

  return (
    <View
      {...props}
      style={[
        config[resolvedMode],
        {
          flex: 1,
          height: '100%',
          width: '100%',
          backgroundColor: themes[resolvedMode].background,
        },
        style,
      ]}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
