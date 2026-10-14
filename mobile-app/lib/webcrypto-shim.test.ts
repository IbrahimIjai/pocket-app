/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { subtleShim } from './webcrypto-shim';

// Cross-check the shim against the platform WebCrypto that Bun ships.
const prf = new Uint8Array(32).map((_, i) => i * 7 + 1);
const info = new TextEncoder().encode('mera.v1.encrypt.secret');
const iv = new Uint8Array(12).map((_, i) => i + 3);
const msg = new TextEncoder().encode('pocket journal');

async function realCiphertext() {
  const s = globalThis.crypto.subtle;
  const m = await s.importKey('raw', prf, 'HKDF', false, ['deriveKey']);
  const k = await s.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info },
    m,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return new Uint8Array(await s.encrypt({ name: 'AES-GCM', iv }, k, msg));
}

async function shimKey() {
  const m = await subtleShim.importKey('raw', prf, 'HKDF', false, ['deriveKey']);
  return subtleShim.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info },
    m,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

describe('webcrypto shim', () => {
  test('matches platform HKDF + AES-GCM byte for byte', async () => {
    const k = await shimKey();
    const ours = new Uint8Array(await subtleShim.encrypt({ name: 'AES-GCM', iv }, k, msg));
    expect(ours).toEqual(await realCiphertext());
  });

  test('decrypts platform ciphertext and rejects tampering', async () => {
    const k = await shimKey();
    const ct = await realCiphertext();
    const pt = new Uint8Array(await subtleShim.decrypt({ name: 'AES-GCM', iv }, k, ct));
    expect(new TextDecoder().decode(pt)).toBe('pocket journal');
    ct[0] ^= 1;
    await expect(subtleShim.decrypt({ name: 'AES-GCM', iv }, k, ct)).rejects.toThrow();
  });
});
