// Minimal crypto.subtle for Hermes, covering exactly what Mera's SecretVault uses:
// importKey(raw → HKDF), deriveKey(HKDF-SHA-256 → AES-GCM-256), encrypt/decrypt(AES-GCM).
// Backed by audited @noble libraries. Only installed when the runtime has no crypto.subtle.
import { gcm } from '@noble/ciphers/aes.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

type ShimKey = { type: 'secret'; algorithm: { name: string }; usages: string[]; raw: Uint8Array };
type Bytes = ArrayBuffer | ArrayBufferView;

const bytes = (b: Bytes) =>
  b instanceof Uint8Array
    ? b
    : ArrayBuffer.isView(b)
      ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
      : new Uint8Array(b);
const algName = (a: string | { name: string }) =>
  (typeof a === 'string' ? a : a.name).toUpperCase();
const toBuffer = (u: Uint8Array) => u.slice().buffer as ArrayBuffer;

function key(name: string, raw: Uint8Array, usages: string[]): ShimKey {
  return { type: 'secret', algorithm: { name }, usages, raw: raw.slice() };
}

function need(k: ShimKey, usage: string, name: string) {
  if (algName(k.algorithm) !== name || !k.usages.includes(usage)) {
    throw new DOMException(`Key not usable for ${usage}`, 'InvalidAccessError');
  }
}

export const subtleShim = {
  async importKey(
    format: string,
    keyData: Bytes,
    algorithm: string | { name: string },
    _extractable: boolean,
    usages: string[]
  ) {
    if (format !== 'raw') throw new DOMException('Only raw keys', 'NotSupportedError');
    const name = algName(algorithm);
    if (name !== 'HKDF' && name !== 'AES-GCM') throw new DOMException(name, 'NotSupportedError');
    return key(name, bytes(keyData), usages);
  },

  async deriveKey(
    params: { name: string; hash: string | { name: string }; salt: Bytes; info: Bytes },
    baseKey: ShimKey,
    derived: { name: string; length: number },
    _extractable: boolean,
    usages: string[]
  ) {
    need(baseKey, 'deriveKey', 'HKDF');
    if (algName(params.hash) !== 'SHA-256' || algName(derived) !== 'AES-GCM') {
      throw new DOMException('Unsupported derivation', 'NotSupportedError');
    }
    const out = hkdf(
      sha256,
      baseKey.raw,
      bytes(params.salt),
      bytes(params.info),
      derived.length / 8
    );
    return key('AES-GCM', out, usages);
  },

  async encrypt(
    params: { name: string; iv: Bytes; additionalData?: Bytes },
    k: ShimKey,
    data: Bytes
  ) {
    need(k, 'encrypt', 'AES-GCM');
    const aad = params.additionalData ? bytes(params.additionalData) : undefined;
    return toBuffer(gcm(k.raw, bytes(params.iv), aad).encrypt(bytes(data)));
  },

  async decrypt(
    params: { name: string; iv: Bytes; additionalData?: Bytes },
    k: ShimKey,
    data: Bytes
  ) {
    need(k, 'decrypt', 'AES-GCM');
    const aad = params.additionalData ? bytes(params.additionalData) : undefined;
    try {
      return toBuffer(gcm(k.raw, bytes(params.iv), aad).decrypt(bytes(data)));
    } catch {
      throw new DOMException('Decryption failed', 'OperationError');
    }
  },
};
