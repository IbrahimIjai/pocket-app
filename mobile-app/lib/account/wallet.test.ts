import { describe, expect, test } from 'bun:test';
import { recoverMessageAddress, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { deriveEvmKey, openWallet, recoveryPhrase } from './wallet';

describe('Pocket passkey wallet', () => {
  test('reproduces the standard 24-word BIP-39 Ethereum account', () => {
    const entropy = new Uint8Array(32);
    expect(recoveryPhrase(entropy)).toBe(`${'abandon '.repeat(23)}art`);
    const key = deriveEvmKey(entropy);
    expect(privateKeyToAccount(toHex(key)).address).toBe(
      '0xF278cF59F82eDcf871d630F28EcC8056f25C1cdb'
    );
    key.fill(0);
  });

  test('clears PRF buffers, signs with the derived account, and refuses signing after end', async () => {
    const entropy = new Uint8Array(32).fill(7);
    const wallet = openWallet({ credentialId: 'test-credential', prfOutput: entropy });
    expect(entropy.every((byte) => byte === 0)).toBe(true);
    const account = wallet.walletClient.account;
    const message = 'Pocket test signing session';
    const signature = await account.signMessage({ message });
    expect(await recoverMessageAddress({ message, signature })).toBe(wallet.address);
    wallet.session.end();
    await expect(account.signMessage({ message })).rejects.toMatchObject({ code: 'SESSION_ENDED' });
  });

  test('clears PRF output on failed derivation', () => {
    const entropy = new Uint8Array(31).fill(7);
    expect(() => openWallet({ credentialId: 'test', prfOutput: entropy })).toThrow();
    expect(entropy.every((byte) => byte === 0)).toBe(true);
  });
});
