// Derived from Category Labs' MIT-licensed Mera mobile demo (2026).
// Import this before expo-router/entry: Hermes needs a cryptographic RNG.
import { getRandomValues } from 'expo-crypto';

if (typeof globalThis.crypto?.getRandomValues !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { ...globalThis.crypto, getRandomValues },
  });
}
