import { createSecp256k1SigningSession, type Secp256k1SigningSession } from '@category-labs/mera';
import { toViemAccount } from '@category-labs/mera/viem';
import { HDKey } from '@scure/bip32';
import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { pocketWalletClient, type PocketWalletClient } from '../chain';

export type PocketWallet = {
  credentialId: string;
  address: `0x${string}`;
  session: Secp256k1SigningSession;
  walletClient: PocketWalletClient;
};

export function recoveryPhrase(prfOutput: Uint8Array): string {
  if (prfOutput.length !== 32) throw new Error('Passkey output must be 32 bytes.');
  return entropyToMnemonic(prfOutput, wordlist);
}

/** Mera demo mapping: PRF entropy → 24-word BIP-39 → standard Ethereum BIP-44. */
export function deriveEvmKey(prfOutput: Uint8Array, index = 0): Uint8Array {
  if (!Number.isSafeInteger(index) || index < 0 || index >= 2 ** 31) {
    throw new Error('Invalid wallet address index.');
  }
  const seed = mnemonicToSeedSync(recoveryPhrase(prfOutput));
  let root: HDKey | undefined;
  let node: HDKey | undefined;
  try {
    root = HDKey.fromMasterSeed(seed);
    node = root.derive(`m/44'/60'/0'/0/${index}`);
    if (!node.privateKey) throw new Error('Wallet derivation failed.');
    return new Uint8Array(node.privateKey);
  } finally {
    seed.fill(0);
    node?.wipePrivateData();
    root?.wipePrivateData();
    // BIP-39 strings and intermediate HD nodes are reclaimed by the JS runtime.
  }
}

/** Takes ownership of the PRF buffer, clearing it even when derivation fails. */
export function openWallet(result: { credentialId: string; prfOutput: Uint8Array }): PocketWallet {
  let privateKey: Uint8Array | undefined;
  let session: Secp256k1SigningSession | undefined;
  try {
    privateKey = deriveEvmKey(result.prfOutput);
    session = createSecp256k1SigningSession({ privateKey });
    const account = toViemAccount(session);
    return {
      credentialId: result.credentialId,
      address: account.address,
      session,
      walletClient: pocketWalletClient(account),
    };
  } catch (error) {
    session?.end();
    throw error;
  } finally {
    privateKey?.fill(0);
    result.prfOutput.fill(0);
  }
}
