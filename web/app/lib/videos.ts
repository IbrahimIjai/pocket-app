// Stable video links for the hackathon submission: /videos/<slug> → YouTube (or wherever).
// Paste the /videos/... URL in the form now. When the video is uploaded, set `url` and push —
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
    title: "Pocket Bot — max-loss trading automation on Perpl (Monad)",
    description: `Pocket Bot trades on Perpl, the fully onchain perps exchange on Monad, using one rule: decide the most you can lose before the trade opens.

What you'll see:
• The bot sizes a BTC trade from a $5 max loss and a 2× multiplier, using live Perpl prices, leverage caps, maintenance margin and fees.
• Demo mode: paper trading on live prices, same rules as the app.
• Live mode: real on-chain trades — approve AUSD → open the Perpl account → IOC market order → live P&L → automatic close on take-profit, stop-loss or time limit → withdraw back to the wallet.
• Every transaction linked on MonadVision.

Only the amount at risk ever enters the exchange, so the worst case is fixed before the trade starts.

Code: https://github.com/IbrahimIjai/pocket-app (mobile-app/scripts/pocket-bot.ts)
App: https://pocket-app-web.vercel.app

Built for Monad Metropolis · Track 01: Onchain Finance & Trading.`,
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
    title:
      "Pocket — trade in dollars with Face ID, never lose more than you chose",
    description: `Pocket is a mobile trading app for people who don't think of themselves as crypto users. Instead of asking "what leverage?", it asks how much you're willing to lose — then sizes the trade and tells you, in one sentence, where it auto-closes and the most you can lose.

In this demo:
• Sign in with a passkey (Face ID / fingerprint) via Mera — no seed phrase, no custody backend.
• Live market data from Perpl on Monad: prices, charts, leverage caps, fees.
• The trade ticket: pick $5 / $10 / $25 and Calm 2× / Bold 5× / Wild 10×, read the plain-English max-loss sentence, check the Details drawer, hold to trade.
• Live P&L and a risk meter (safe → watch → close to auto-close), close, receipt, activity.
• Demo mode: $1,000 of play money on live prices, then switch to Live.

Your dollars (AUSD) stay in your own wallet; only the amount at risk moves into Perpl, so the rest can't be liquidated.

Stack: Expo / React Native · Mera passkeys · AUSD · Perpl · Monad · Alchemy.
Code: https://github.com/IbrahimIjai/pocket-app
App: https://pocket-app-web.vercel.app

Built for Monad Metropolis · Track 01: Onchain Finance & Trading.`,
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
      "Pocket — Mera login, AUSD balance and a Perpl trade in under 2 minutes",
    description:
      "Pocket on Monad: sign in with a passkey (Mera), see your AUSD dollar balance, and place a max-loss trade on Perpl — with the auto-close price and worst case shown before you tap.\n\nCode: https://github.com/IbrahimIjai/pocket-app\nApp: https://pocket-app-web.vercel.app",
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
      "Pocket — Mera as the whole account layer (no seed phrase, no extension)",
    description:
      "Create a Monad account with Face ID, sign back in to the same address, back up with a passkey re-prompt, and trade with a hold-to-confirm on an in-memory Mera session.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
      "Pocket — one passkey, many keys: an encrypted trade journal with Mera PRF",
    description:
      "The same Mera passkey derives the wallet key and a separate journal key (HKDF namespace pocket/journal/v1) that encrypts the trade journal on device.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket Risk — Perpl protocol + wallet risk dashboard",
    description:
      "Live Perpl markets (mark, funding, OI, TVL, max leverage, maintenance margin) plus any wallet's positions with auto-close price, distance-to-liquidation meter and max-loss sizing.\n\nDashboard: https://pocket-app-web.vercel.app/dashboard\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket — real-time trading on Monad over Alchemy RPC",
    description:
      "Balances, positions, gas estimation and transaction receipts for Pocket's Perpl trades all run over Alchemy's Monad RPC, with automatic failover.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket — trade history indexed with Envio HyperIndex",
    description:
      "Pocket's Activity screen reads the user's Perpl history from an Envio HyperIndex indexer on Monad.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket — add dollars from any chain with Aurora Intents",
    description:
      "Deposit USDC/USDT from another chain and receive AUSD in your Pocket on Monad, ready to trade.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket — what big wallets are doing, powered by Nansen",
    description:
      "A smart-money card on Pocket's market screen, powered by the Nansen API, gives casual traders professional context before they trade.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
    title: "Pocket — spot Buy tab on Kuru",
    description:
      "Plain spot buying through Kuru's on-chain order book on Monad, with the same Face ID confirm and plain-English summary.\n\nCode: https://github.com/IbrahimIjai/pocket-app",
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
