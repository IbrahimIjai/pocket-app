// Creates deployable .well-known files from PUBLIC domain/certificate metadata.
// Does not deploy, request credentials, or modify Expo's generated native projects.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Input = {
  rpId: string;
  android: { packageName: string; sha256Fingerprints: string[] }[];
  appleTeamId?: string;
};

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath)
    throw new Error(
      'Usage: bun run scripts/prepare-passkey-association.ts <metadata.json> [output-directory]'
    );
  const input: Input = JSON.parse(await readFile(inputPath, 'utf8'));
  if (
    typeof input.rpId !== 'string' ||
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(input.rpId)
  ) {
    throw new Error('rpId must be your permanent HTTPS hostname, without a scheme, port, or path.');
  }
  const packages = ['com.pocket.dev', 'com.pocket.preview', 'com.pocket.app'];
  if (!Array.isArray(input.android) || input.android.length === 0)
    throw new Error('Provide Android signing certificate fingerprints.');
  const seen = new Set<string>();
  const assetlinks = input.android.map((entry) => {
    if (!packages.includes(entry.packageName) || seen.has(entry.packageName))
      throw new Error('Provide one entry per Pocket application variant.');
    seen.add(entry.packageName);
    if (
      !Array.isArray(entry.sha256Fingerprints) ||
      entry.sha256Fingerprints.length === 0 ||
      !entry.sha256Fingerprints.every(
        (value) =>
          typeof value === 'string' && /^(?:[0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$/.test(value)
      )
    ) {
      throw new Error(
        'Each SHA-256 fingerprint must contain 32 colon-separated hexadecimal bytes.'
      );
    }
    return {
      relation: ['delegate_permission/common.get_login_creds'],
      target: {
        namespace: 'android_app',
        package_name: entry.packageName,
        sha256_cert_fingerprints: entry.sha256Fingerprints.map((value) => value.toUpperCase()),
      },
    };
  });
  if (input.appleTeamId && !/^[A-Z0-9]{10}$/.test(input.appleTeamId))
    throw new Error('Apple team ID must be 10 uppercase letters/digits.');
  const output = resolve(process.argv[3] || `scripts/associations/${input.rpId}`, '.well-known');
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'assetlinks.json'), JSON.stringify(assetlinks, null, 2) + '\n');
  if (input.appleTeamId) {
    await writeFile(
      resolve(output, 'apple-app-site-association'),
      JSON.stringify(
        { webcredentials: { apps: packages.map((name) => `${input.appleTeamId}.${name}`) } },
        null,
        2
      ) + '\n'
    );
  }
  console.log(`Association files prepared for ${input.rpId}: ${output}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Could not prepare association files.');
  process.exitCode = 1;
});
