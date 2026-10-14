// Stable video links for the hackathon submission: /videos/<slug> → YouTube (or wherever).
// Paste the /videos/... URL in the form now. When the video is uploaded, set `url` and push
// the page then redirects straight to it. Until then it shows the YouTube copy below.
//
//   https://pocket-app-web.vercel.app/videos/bot_demo   → Perpl bounty: trading bot / automation
//   https://pocket-app-web.vercel.app/videos/app_demo   → Main submission: the Pocket app

export type Video = {
  url: string // YouTube link once uploaded ("" = show the upload-pending page)
  title: string // YouTube title (≤ 100 chars)
  description: string // YouTube description
  tags: string[] // YouTube tags
}

export const VIDEOS: Record<string, Video> = {
  bot_demo: {
    url: "",
    title: "Pocket Bot: max-loss trading automation on Perpl (Monad)",
    description:
      "Pocket Bot sizes Perpl trades from a dollar risk budget and closes on take-profit, stop-loss or a time limit. Demo uses live prices; a funded live run is pending.\n\nCode: https://github.com/IbrahimIjai/pocket-app\nApp: https://pocket-app-web.vercel.app",
    tags: [
      "Pocket",
      "Perpl",
      "Monad",
      "trading bot",
      "automation",
      "perpetuals",
      "perps",
      "onchain trading",
      "DeFi",
      "AUSD",
      "Agora",
      "risk management",
      "max loss",
      "stop loss",
      "take profit",
      "Monad Metropolis",
      "hackathon",
      "crypto trading",
      "BTC",
    ],
  },
  app_demo: {
    url: "",
    title: "Pocket: dollar risk budgets and passkey accounts on Monad",
    description:
      "Pocket combines Mera passkeys, AUSD and Perpl on Monad. Choose a risk budget, preview fees and estimated auto-close, then track the trade. Demo starts with $1,000 of play money on live prices. Device and funded-trade verification are pending.\n\nCode: https://github.com/IbrahimIjai/pocket-app\nApp: https://pocket-app-web.vercel.app",
    tags: [
      "Pocket",
      "Monad",
      "Perpl",
      "Mera",
      "passkey",
      "Face ID",
      "AUSD",
      "Agora",
      "mobile trading app",
      "perpetuals",
      "DeFi",
      "self-custody",
      "Expo",
      "React Native",
      "risk management",
      "Monad Metropolis",
      "hackathon",
      "crypto trading",
    ],
  },
  agora_demo: {
    url: "",
    title:
      "Pocket: Mera login, AUSD balance and a Perpl trade in under 2 minutes",
    description:
      "Pocket combines Mera accounts, AUSD balances and Perpl trading in one native app. Preview risk and fees, track P&L, and practise on live prices in Demo. A funded mainnet round trip is pending.\n\nCode: https://github.com/IbrahimIjai/pocket-app\nApp: https://pocket-app-web.vercel.app",
    tags: [
      "Agora",
      "AUSD",
      "Mera",
      "passkey",
      "Perpl",
      "mobile trading app",
      "stablecoin",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  mera_ux_demo: {
    url: "",
    title:
      "Pocket: Mera as the whole account layer (no seed phrase, no extension)",
    description:
      "Mera handles Pocket account creation, sign-in, signing and recovery. The same passkey derives the same address; signing keys stay in an expiring memory-only session. On-device verification is pending.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Mera",
      "passkey",
      "Face ID",
      "WebAuthn PRF",
      "account abstraction",
      "UX",
      "self-custody",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  mera_keys_demo: {
    url: "",
    title:
      "Pocket: one passkey, many keys: an encrypted trade journal with Mera PRF",
    description:
      "Planned: derive a separate journal key from the Mera passkey to encrypt trade history and settings. This non-account integration is not yet built.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Mera",
      "passkey",
      "PRF",
      "HKDF",
      "AES-GCM",
      "encryption",
      "privacy",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  perpl_risk_demo: {
    url: "",
    title: "Pocket Risk: Perpl protocol + wallet risk dashboard",
    description:
      "Pocket turns Perpl prices, margins and fees into trade sizing, estimated auto-close and a live risk meter. The mobile tool is built; the combined protocol-and-wallet web dashboard is planned.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Perpl",
      "risk management",
      "analytics",
      "dashboard",
      "perpetuals",
      "liquidation",
      "DeFi",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  alchemy_demo: {
    url: "",
    title: "Pocket: real-time trading on Monad over Alchemy RPC",
    description:
      "Pocket supports an Alchemy Monad RPC endpoint for balances, positions, gas estimates and transactions, with a public-RPC fallback. Configuration and verification are pending.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Alchemy",
      "RPC",
      "Monad RPC",
      "viem",
      "Perpl",
      "DeFi",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  envio_demo: {
    url: "",
    title: "Pocket: trade history indexed with Envio HyperIndex",
    description:
      "Planned: use Envio HyperIndex for Perpl trading history on Monad, with fills, results and transaction links across devices. The indexer integration is not yet built.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Envio",
      "HyperIndex",
      "indexer",
      "GraphQL",
      "Perpl",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  aurora_demo: {
    url: "",
    title: "Pocket: add dollars from any chain with Aurora Intents",
    description:
      "Planned: use Aurora Intents to fund Pocket from supported chains. Deposit routing and AUSD delivery on Monad still need implementation and verification.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Aurora",
      "Intents",
      "cross-chain",
      "bridge",
      "AUSD",
      "onboarding",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  nansen_demo: {
    url: "",
    title: "Pocket: what big wallets are doing, powered by Nansen",
    description:
      "Planned: add Nansen smart-money activity to Pocket market screens for concise context before trading. The API integration and card are not yet built.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Nansen",
      "smart money",
      "on-chain analytics",
      "Perpl",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
  kuru_demo: {
    url: "",
    title: "Pocket: spot Buy tab on Kuru",
    description:
      "Planned: add spot buying through Kuru using Pocket’s Mera account, with a clear price, amount and fee preview. The spot flow is not yet built.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
    tags: [
      "Kuru",
      "spot trading",
      "order book",
      "consumer app",
      "MON",
      "Pocket",
      "Monad",
      "Monad Metropolis",
      "hackathon",
    ],
  },
}
