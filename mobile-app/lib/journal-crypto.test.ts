/// <reference types="bun" />
import { expect, mock, test } from 'bun:test';

// journal-crypto imports the passkey/AsyncStorage modules; seal/unseal need neither.
mock.module('./account/passkey', () => ({
  passkeyClient: async () => ({}),
  requireRpId: () => 'x.y',
}));
mock.module('./persist', () => ({ KEYS: {}, loadJson: async () => null, saveJson: () => {} }));
const { seal, unseal } = await import('./journal-crypto');

test('seal/unseal roundtrip, fresh nonce each time, wrong key fails', () => {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const data = { trades: [{ id: 'live-1', pnlUsd: 1.62 }] };
  const a = seal(key, data);
  const b = seal(key, data);
  expect(a.nonce).not.toBe(b.nonce);
  expect(a.ct).not.toContain('live-1');
  expect(unseal(key, a)).toEqual(data);
  const other = crypto.getRandomValues(new Uint8Array(32));
  expect(() => unseal(other, a)).toThrow();
});
