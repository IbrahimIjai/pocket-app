import type { ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';

// Pause polling while the app is in the background.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener('change', (s) => setFocused(s === 'active'));
    return () => sub.remove();
  });
}

const client = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 2_000 } },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
