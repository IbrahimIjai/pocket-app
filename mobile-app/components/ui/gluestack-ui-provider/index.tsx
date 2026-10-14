import React from 'react';
import { config } from './config';
import { View } from 'react-native';
import { colors } from '@/theme/brand';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';

export function GluestackUIProvider({
  mode = 'dark',
  ...props
}: {
  mode?: 'light' | 'dark';
  children?: any;
}) {
  return (
    <View
      style={[
        config[mode],
        {
          flex: 1,
          height: '100%',
          width: '100%',
          backgroundColor: mode === 'dark' ? colors.ink : colors.paper,
        },
        // @ts-ignore
        props.style,
      ]}>
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
