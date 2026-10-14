import { createPasskeyWithPrfOutput, getPasskeyPrfOutput, isMeraError } from '@category-labs/mera';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { config } from '../config';
import { openWallet, recoveryPhrase, type PocketWallet } from './wallet';
import { saveCredentialId } from './storage';

export function passkeysAvailable(): boolean {
  return (
    Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  );
}

export function requireRpId(): string {
  const rpId = config.rpId.trim().toLowerCase();
  if (
    !rpId ||
    rpId === 'localhost' ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(rpId)
  ) {
    throw new Error('Pocket accounts are not available yet. You can still try Demo mode.');
  }
  return rpId;
}

async function passkeyClient() {
  if (!passkeysAvailable()) {
    throw new Error('Install Pocket on your phone to use a passkey. You can still try Demo mode.');
  }
  // Keep the unlinked native passkey module out of Expo Go's startup path.
  const { reactNativeWebAuthnClient } =
    await import('@category-labs/mera/react-native-webauthn-client');
  return reactNativeWebAuthnClient;
}

async function remember(result: {
  credentialId: string;
  prfOutput: Uint8Array;
}): Promise<PocketWallet> {
  const wallet = openWallet(result);
  try {
    await saveCredentialId(wallet.credentialId);
    return wallet;
  } catch (error) {
    wallet.session.end();
    throw error;
  }
}

export async function createPocket(name = 'My Pocket'): Promise<PocketWallet> {
  const rpId = requireRpId();
  const webAuthnClient = await passkeyClient();
  const result = await createPasskeyWithPrfOutput({
    rp: { id: rpId, name: 'Pocket' },
    user: { name: 'pocket', displayName: name.trim() || 'My Pocket' },
    webAuthnClient,
  });
  return remember(result);
}

export async function signIn(): Promise<PocketWallet> {
  const rpId = requireRpId();
  const webAuthnClient = await passkeyClient();
  // Discoverable request lets the password manager offer existing Pocket accounts.
  const result = await getPasskeyPrfOutput({ rpId, webAuthnClient });
  return remember(result);
}

export async function revealRecoveryPhrase(credentialId: string): Promise<string> {
  const rpId = requireRpId();
  const webAuthnClient = await passkeyClient();
  const result = await getPasskeyPrfOutput({ rpId, credential: { credentialId }, webAuthnClient });
  try {
    return recoveryPhrase(result.prfOutput);
  } finally {
    result.prfOutput.fill(0);
  }
}

export function describeAccountError(error: unknown): string {
  if (isMeraError(error)) {
    switch (error.code) {
      case 'PRF_UNAVAILABLE':
        return 'Your password manager does not support Pocket passkeys yet. Try Google Password Manager on Android or iCloud Keychain on iOS 18 or newer.';
      case 'PASSKEY_OPERATION_FAILED':
        return 'The passkey request did not finish. Try again and check Pocket’s app/domain association if it keeps failing.';
      case 'SESSION_ENDED':
        return 'Your signing session ended. Unlock your Pocket again.';
      default:
        return 'Pocket could not unlock this account. Please try again.';
    }
  }
  return error instanceof Error
    ? error.message
    : 'Pocket could not unlock this account. Please try again.';
}
