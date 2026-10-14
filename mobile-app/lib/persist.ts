import AsyncStorage from '@react-native-async-storage/async-storage';

// Non-secret app state only (mode, demo account). Secrets never go here — see lib/account/storage.ts.
export async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
    // Best effort: losing demo state is acceptable, crashing is not.
  });
}

export const KEYS = {
  mode: 'pocket.mode.v1',
  demo: 'pocket.demo.v1',
  prefs: 'pocket.prefs.v1',
  journal: 'pocket.journal.v1',
} as const;
