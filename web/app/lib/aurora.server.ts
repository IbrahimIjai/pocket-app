// Aurora Intents: "add dollars from any chain". Funds arrive as USDC on Monad in the user's own
// Pocket wallet (AUSD isn't an Aurora destination yet; Pocket converts USDC→AUSD on Monad).
// AURORA_API_KEY stays on the server (studio.aurora.dev).
import { getAddress, isAddress } from "viem"

const API = "https://intents-api.aurora.dev/api"
export const MONAD_USDC_ASSET =
  "nep245:v2_1.omni.hot.tg:143_2dmLwYWkCQKyTjeUPAsGJuiVLbFx" // USDC on Monad, 6 dp

// EVM sources only: the user's Pocket address is the same EOA on every EVM chain, so it's a
// valid refund address there.
export const ORIGINS = {
  "base-usdc": {
    label: "USDC on Base",
    decimals: 6,
    asset: "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
  },
  "arb-usdc": {
    label: "USDC on Arbitrum",
    decimals: 6,
    asset: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
  },
  "eth-usdc": {
    label: "USDC on Ethereum",
    decimals: 6,
    asset: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
  },
  "op-usdc": {
    label: "USDC on Optimism",
    decimals: 6,
    asset: "nep245:v2_1.omni.hot.tg:10_A2ewyUyDp6qsue1jqZsGypkCxRJ",
  },
  "pol-usdc": {
    label: "USDC on Polygon",
    decimals: 6,
    asset: "nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L",
  },
  "eth-usdt": {
    label: "USDT on Ethereum",
    decimals: 6,
    asset: "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near",
  },
} as const
export type OriginKey = keyof typeof ORIGINS

const MIN_USD = 1
const MAX_USD = 10_000

function key() {
  const k = process.env.AURORA_API_KEY
  if (!k)
    throw new Response(
      JSON.stringify({ error: "Any-chain deposits aren’t configured yet." }),
      { status: 503 }
    )
  return encodeURIComponent(k)
}

const bad = (error: string, status = 400) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  })

export async function createDeposit(input: {
  recipient?: unknown
  origin?: unknown
  amount?: unknown
}) {
  if (typeof input.recipient !== "string" || !isAddress(input.recipient))
    throw bad("Invalid Pocket address.")
  if (typeof input.origin !== "string" || !(input.origin in ORIGINS))
    throw bad("Unsupported source chain.")
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD)
    throw bad(`Amount must be $${MIN_USD}–$${MAX_USD.toLocaleString()}.`)

  const origin = ORIGINS[input.origin as OriginKey]
  const recipient = getAddress(input.recipient)
  const res = await fetch(`${API}/quote/${key()}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      dry: false,
      swapType: "EXACT_INPUT",
      depositType: "ORIGIN_CHAIN",
      amount: String(Math.round(amount * 10 ** origin.decimals)),
      originAsset: origin.asset,
      destinationAsset: MONAD_USDC_ASSET,
      slippageTolerance: 100,
      refundTo: recipient,
      refundType: "ORIGIN_CHAIN",
      recipient,
      recipientType: "DESTINATION_CHAIN",
    }),
  })
  const json = (await res.json()) as {
    message?: string
    quote?: {
      depositAddress?: string
      amountInFormatted?: string
      amountOutFormatted?: string
      timeEstimate?: number
      deadline?: string
    }
  }
  if (!res.ok || !json.quote?.depositAddress)
    throw bad(
      json.message ?? "Couldn’t get a deposit address. Try again.",
      res.ok ? 502 : res.status
    )
  return {
    origin: input.origin,
    originLabel: origin.label,
    depositAddress: json.quote.depositAddress,
    amountIn: json.quote.amountInFormatted,
    amountOut: json.quote.amountOutFormatted,
    timeEstimateSec: json.quote.timeEstimate,
    deadline: json.quote.deadline,
  }
}

export async function depositStatus(depositAddress: string | null) {
  if (!depositAddress || !/^0x[0-9a-fA-F]{40}$/.test(depositAddress))
    throw bad("Invalid deposit address.")
  const res = await fetch(
    `${API}/status/${key()}?depositAddress=${depositAddress}`
  )
  const json = (await res.json()) as {
    message?: string
    status?: string
    swapDetails?: {
      amountOutFormatted?: string
      destinationChainTxHashes?: { hash?: string }[]
      refundReason?: string
    }
  }
  if (!res.ok) throw bad(json.message ?? "Status unavailable.", res.status)
  return {
    status: json.status ?? "UNKNOWN", // PENDING_DEPOSIT | KNOWN_DEPOSIT_TX | PROCESSING | SUCCESS | REFUNDED | FAILED | INCOMPLETE_DEPOSIT
    amountOut: json.swapDetails?.amountOutFormatted,
    destinationTx: json.swapDetails?.destinationChainTxHashes?.[0]?.hash,
    refundReason: json.swapDetails?.refundReason,
  }
}
