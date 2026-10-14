// Nansen "what big wallets are doing": smart-money perp flows (Hyperliquid) for a coin, last 24h.
// NANSEN_API_KEY stays on the server. Results are cached to save API credits.
const API = "https://api.nansen.ai/api/v1/smart-money/perp-trades"
const TTL_MS = 5 * 60_000
const LOOKBACK_HOURS = 24
const cache = new Map<string, { at: number; value: SmartMoney }>()

type RawTrade = {
  trader_address_label?: string
  side?: string
  action?: string
  value_usd?: number
  token_symbol?: string
  block_timestamp?: string
}

export type SmartMoney = {
  symbol: string
  lookbackHours: number
  longOpenedUsd: number // Open/Add on long side
  shortOpenedUsd: number // Open/Add on short side
  longClosedUsd: number // Reduce/Close on long side
  shortClosedUsd: number
  traders: number
  trades: number
  bias: "long" | "short" | "neutral"
  top: {
    label: string
    side: string
    action: string
    valueUsd: number
    at?: string
  }[]
}

const bad = (error: string, status = 400) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  })

export async function smartMoney(
  rawSymbol: string | null
): Promise<SmartMoney> {
  const symbol = (rawSymbol ?? "").toUpperCase()
  if (!/^[A-Z0-9]{2,10}$/.test(symbol)) throw bad("Invalid symbol.")
  const key = process.env.NANSEN_API_KEY
  if (!key) throw bad("Smart-money data isn’t configured yet.", 503)

  const hit = cache.get(symbol)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value

  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: key },
    body: JSON.stringify({
      lookback_hours: LOOKBACK_HOURS,
      filters: { token_symbol: symbol },
      pagination: { page: 1, per_page: 500 },
      order_by: [{ field: "value_usd", direction: "DESC" }],
    }),
  })
  const json = (await res.json().catch(() => ({}))) as {
    data?: RawTrade[]
    message?: string
    detail?: unknown
  }
  if (!res.ok || !Array.isArray(json.data))
    throw bad(
      json.message ?? "Nansen is unavailable right now.",
      res.status === 401 ? 503 : 502
    )

  const v = {
    longOpenedUsd: 0,
    shortOpenedUsd: 0,
    longClosedUsd: 0,
    shortClosedUsd: 0,
  }
  const traders = new Set<string>()
  for (const t of json.data) {
    const usd = Number(t.value_usd) || 0
    const long = (t.side ?? "").toLowerCase() === "long"
    const opening = ["open", "add"].includes((t.action ?? "").toLowerCase())
    if (opening) long ? (v.longOpenedUsd += usd) : (v.shortOpenedUsd += usd)
    else long ? (v.longClosedUsd += usd) : (v.shortClosedUsd += usd)
    if (t.trader_address_label) traders.add(t.trader_address_label)
  }
  const net = v.longOpenedUsd - v.shortOpenedUsd
  const gross = v.longOpenedUsd + v.shortOpenedUsd
  const value: SmartMoney = {
    symbol,
    lookbackHours: LOOKBACK_HOURS,
    ...v,
    traders: traders.size,
    trades: json.data.length,
    bias:
      gross === 0 || Math.abs(net) / gross < 0.1
        ? "neutral"
        : net > 0
          ? "long"
          : "short",
    top: json.data.slice(0, 3).map((t) => ({
      label: t.trader_address_label || "Smart trader",
      side: t.side ?? "",
      action: t.action ?? "",
      valueUsd: Number(t.value_usd) || 0,
      at: t.block_timestamp,
    })),
  }
  cache.set(symbol, { at: Date.now(), value })
  return value
}
