import * as SecureStore from 'expo-secure-store';

const CREDENTIAL_KEY = 'pocket.credential.v1';

function validCredential(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 2048 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

// Only public credential metadata is persisted. Never PRF output, seed, or key.
export async function saveCredentialId(credentialId: string): Promise<void> {
  if (!validCredential(credentialId)) throw new Error('Invalid passkey credential.');
  await SecureStore.setItemAsync(CREDENTIAL_KEY, JSON.stringify({ credentialId }), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadCredentialId(): Promise<string | undefined> {
  const raw = await SecureStore.getItemAsync(CREDENTIAL_KEY);
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === 'object' &&
      'credentialId' in value &&
      validCredential(value.credentialId)
    ) {
      return value.credentialId;
    }
  } catch {
    // Malformed metadata cannot select a passkey.
  }
  await SecureStore.deleteItemAsync(CREDENTIAL_KEY);
  return undefined;
}
