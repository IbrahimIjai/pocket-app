Run commands from `mobile-app` using the global Bun installation.

`bun run probe:perpl` reads Monad mainnet and Perpl's public context. Set
`PROBE_ADDRESS` to a public wallet address to inspect its exchange account;
otherwise the probe demonstrates the account-not-found response with the zero
address. No key is read and no transaction is signed or submitted. The dated
fixture is an observation, not configuration for future trades.

For passkeys, copy `passkey-association.example.json` to a metadata file and fill
in the permanent rpId and the real SHA-256 signing fingerprints for each variant.
Leave out variants you have not built; add them once their certificates exist.
Never use a private key or keystore password in this metadata.

```bash
bun run scripts/prepare-passkey-association.ts metadata.json /tmp/pocket-associations
```

Serve the resulting `.well-known/assetlinks.json` on the rpId over HTTPS with
`Content-Type: application/json` and no redirect. Supply the Apple team ID to
also generate `.well-known/apple-app-site-association`. Deploying these files is
a separate step. Set `EXPO_PUBLIC_RP_ID` to that same hostname and rebuild the
development client. Passkeys require the development client; Expo Go keeps Demo
available. The association script never publishes files or reads signing keys.
