// Derived from Category Labs' MIT-licensed Mera mobile demo (2026).
// Import this before expo-router/entry: Hermes needs a cryptographic RNG, and Mera's
// SecretVault needs crypto.subtle (HKDF + AES-GCM), which Hermes doesn't ship.
import { getRandomValues } from 'expo-crypto';
import { subtleShim } from './webcrypto-shim';

const current = globalThis.crypto as Crypto | undefined;
if (typeof current?.getRandomValues !== 'function' || !current?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      ...current,
      getRandomValues: current?.getRandomValues?.bind(current) ?? getRandomValues,
      subtle: current?.subtle ?? subtleShim,
    },
  });
}
