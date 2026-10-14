# Pocket

**Trade in dollars with Face ID — and never lose more than you chose.**

Pocket asks two questions instead of "what leverage?": *how much are you willing to lose* and *how bold*. It sizes a perpetuals trade on [Perpl](https://app.perpl.xyz) (Monad), shows the exact auto-close price in plain English, and moves only the amount at risk out of your wallet.

- **Account:** passkey (Face ID / fingerprint) via [Mera](https://github.com/category-labs/mera). No seed phrase, no custody backend.
- **Dollars:** AUSD on Monad (chain 143).
- **Execution:** Perpl Exchange contract, called directly from the user's own account.
- **Demo mode:** $1,000 of play money on live Perpl prices, with the same risk engine, fees and auto-close.

## Run it

```bash
bun install
cp .env.example .env            # EXPO_PUBLIC_* config; no secrets

# Demo mode + live prices (Expo Go, SDK 57)
bunx expo start --go

# Passkeys + live trading need the development build (Expo Go has no passkey module)
eas build --platform android --profile development
bunx expo start                 # then open the installed "Pocket Dev" app
```

Passkeys are bound to the rpId `0xmegie.github.io`, which serves `/.well-known/assetlinks.json` for each signing certificate (see `scripts/README.md`).

## Layout

| Path | What |
|---|---|
| `app/` | Screens (expo-router): welcome, tabs (home, activity, you), market, trade ticket, live trade, receipt, add dollars |
| `lib/risk.ts` | "Max loss first" sizing, auto-close price, risk meter (unit-tested) |
| `lib/perpl/` | Perpl REST client, units, ABI, chain reads, live trade execution |
| `lib/account/` | Mera passkey → BIP-44 wallet, in-memory signing session with idle/background expiry |
| `lib/demo.tsx`, `lib/mode.tsx`, `lib/journal.tsx` | Demo engine, Demo/Live mode, live trade journal (persisted) |
| `hooks/usePortfolio.ts` | Single source of balances / positions / history for the current mode |

## Checks

```bash
bunx tsc --noEmit && bun run lint && bun test lib
```
