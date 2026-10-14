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

export async function passkeyClient() {
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

/** react-native-passkey rejects with `{ error: code, message }`; Mera keeps it as `cause`. */
function describePasskeyFailure(cause: unknown): string {
  const native = (cause ?? {}) as { error?: unknown; message?: unknown };
  const code = typeof native.error === 'string' ? native.error : '';
  const detail = typeof native.message === 'string' ? native.message : '';
  switch (code) {
    case 'UserCancelled':
      return 'The passkey prompt was closed. Tap the button again when you’re ready.';
    case 'NoCredentials':
      return 'No Pocket passkey on this phone yet. Tap Create my Pocket instead.';
    case 'NoCreateOption':
    case 'NotConfigured':
      return 'This phone can’t save passkeys yet. Sign in to a Google account and turn on Google Password Manager (Settings → Passwords & accounts), then try again.';
    case 'NotSupported':
      return 'This phone doesn’t support passkeys. You can still try Demo mode.';
    case 'CredentialAlreadyExists':
      return 'This phone already has a Pocket passkey. Tap I already have one.';
    case 'TimedOut':
    case 'Interrupted':
      return 'The passkey prompt timed out. Please try again.';
    case 'RequestFailed':
    case 'BadConfiguration':
      return `Android couldn’t verify Pocket for passkeys (${detail || code}). Check you’re online and try again in a minute.`;
    default:
      return `The passkey request did not finish${detail || code ? ` (${detail || code})` : ''}. Please try again.`;
  }
}

export function describeAccountError(error: unknown): string {
  if (isMeraError(error)) {
    switch (error.code) {
      case 'PRF_UNAVAILABLE':
        return 'Your password manager does not support Pocket passkeys yet. Try Google Password Manager on Android or iCloud Keychain on iOS 18 or newer.';
      case 'PASSKEY_OPERATION_FAILED':
        return describePasskeyFailure(error.cause);
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
