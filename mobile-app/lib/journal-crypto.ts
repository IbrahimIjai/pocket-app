// "One passkey, many keys": the trade journal is encrypted with its own key, sealed in a
// Mera SecretVault. The vault uses a fresh random PRF salt, so its PRF output (and the
// HKDF-derived AES key inside Mera) is unrelated to the wallet key from the same passkey.
// Nothing here signs transactions: this PRF namespace does storage encryption only.
import {
  createSecretVaultWithExistingPasskey,
  decryptSecretVaultWithPasskey,
  parseSecretVault,
  type PasskeySecretVault,
} from '@category-labs/mera';
import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { passkeyClient, requireRpId } from './account/passkey';
import { KEYS, loadJson, saveJson } from './persist';

const NONCE_BYTES = 12;
const KEY_BYTES = 32;
const AAD = new TextEncoder().encode('pocket.journal.v1');

export type Sealed = { v: 1; nonce: string; ct: string };

export async function loadVault(): Promise<PasskeySecretVault | null> {
  const raw = await loadJson<unknown>(KEYS.journalVault);
  if (!raw) return null;
  try {
    return parseSecretVault(raw);
  } catch {
    return null;
  }
}

/** First unlock: make a random journal key and seal it in a vault for this passkey. */
export async function createJournalKey(credentialId: string): Promise<Uint8Array> {
  const journalKey = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  const vault = await createSecretVaultWithExistingPasskey({
    rpId: requireRpId(),
    credential: { credentialId },
    secret: journalKey,
    webAuthnClient: await passkeyClient(),
  });
  saveJson(KEYS.journalVault, vault);
  return journalKey;
}

/** Later unlocks: one passkey prompt opens the vault and returns the journal key. */
export async function openJournalKey(vault: PasskeySecretVault): Promise<Uint8Array> {
  return decryptSecretVaultWithPasskey({
    rpId: requireRpId(),
    vault,
    webAuthnClient: await passkeyClient(),
  });
}

export function seal(journalKey: Uint8Array, value: unknown): Sealed {
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const pt = new TextEncoder().encode(JSON.stringify(value));
  const ct = gcm(journalKey, nonce, AAD).encrypt(pt);
  return { v: 1, nonce: bytesToHex(nonce), ct: bytesToHex(ct) };
}

export function unseal<T>(journalKey: Uint8Array, sealed: Sealed): T {
  const pt = gcm(journalKey, hexToBytes(sealed.nonce), AAD).decrypt(hexToBytes(sealed.ct));
  return JSON.parse(new TextDecoder().decode(pt)) as T;
}
