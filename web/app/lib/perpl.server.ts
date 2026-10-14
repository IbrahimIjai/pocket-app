// Server-side Perpl reads for the risk dashboard: public REST (protocol view) + Monad RPC (wallet view).
import {
  createPublicClient,
  fallback,
  getAddress,
  http,
  isAddress,
  type Address,
} from "viem"
import { monad } from "viem/chains"

const API = "https://app.perpl.xyz/api"
const EXCHANGE = getAddress("0x34B6552d57a35a1D042CcAe1951BD1C370112a6F")
const RPC = process.env.MONAD_RPC_URL || "https://rpc.monad.xyz"
const CNS_DECIMALS = 6 // AUSD and Perpl collateral (verified 2026-10-14)

const client = createPublicClient({
  chain: monad,
  transport: fallback([
    http(RPC, { timeout: 10_000 }),
    http("https://rpc.monad.xyz", { timeout: 10_000 }),
  ]),
})

const ABI = [
  {
    type: "function",
    name: "getAccountByAddr",
    stateMutability: "view",
    inputs: [{ name: "accountAddress", type: "address" }],
    outputs: [
      {
        name: "accountInfo",
        type: "tuple",
        components: [
          { name: "accountId", type: "uint256" },
          { name: "balanceCNS", type: "uint256" },
          { name: "lockedBalanceCNS", type: "uint256" },
          { name: "frozen", type: "uint8" },
          { name: "accountAddr", type: "address" },
          {
            name: "positions",
            type: "tuple",
            components: [
              { name: "bank1", type: "uint256" },
              { name: "bank2", type: "uint256" },
              { name: "bank3", type: "uint256" },
              { name: "bank4", type: "uint256" },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getPosition",
    stateMutability: "view",
    inputs: [
      { name: "perpId", type: "uint256" },
      { name: "accountId", type: "uint256" },
    ],
    outputs: [
      {
        name: "positionInfo",
        type: "tuple",
        components: [
          { name: "accountId", type: "uint256" },
          { name: "nextNodeId", type: "uint256" },
          { name: "prevNodeId", type: "uint256" },
          { name: "positionType", type: "uint8" },
          { name: "depositCNS", type: "uint256" },
          { name: "pricePNS", type: "uint256" },
          { name: "lotLNS", type: "uint256" },
          { name: "entryBlock", type: "uint256" },
          { name: "pnlCNS", type: "int256" },
          { name: "deltaPnlCNS", type: "int256" },
          { name: "premiumPnlCNS", type: "int256" },
        ],
      },
      { name: "markPricePNS", type: "uint256" },
      { name: "markPriceValid", type: "bool" },
    ],
  },
] as const

type RawState = {
  mrk: number
  prv: number
  oi: number
  tvl: string
  dva: string
}
type RawMarket = {
  id: number
  symbol: string
  name: string
  size_units: string
  funding_interval_sec: number
  config: {
    is_open: boolean
    price_decimals: number
    size_decimals: number
    initial_margin: number
    maintenance_margin: number
    taker_fee: number
  }
  state: RawState
  funding?: { rate: number }
}

export type MarketRow = {
  id: number
  symbol: string
  price: number
  change24hPct: number
  fundingPctPerHour: number
  openInterestUsd: number
  tvlUsd: number
  volume24hUsd: number
  maxLeverage: number
  mmr: number
  takerFeePct: number
  priceDecimals: number
  sizeDecimals: number
}

const usd = (cns: string | bigint | number) => Number(cns) / 10 ** CNS_DECIMALS

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { accept: "application/json" },
  })
  if (!r.ok) throw new Error(`Perpl ${r.status}`)
  return r.json() as Promise<T>
}

export async function loadMarkets(): Promise<MarketRow[]> {
  const [ctx, ticker] = await Promise.all([
    get<{ markets: RawMarket[] }>("/v1/pub/context"),
    get<{ d: Record<string, RawState> }>("/v1/market-data/ticker").catch(
      () => ({ d: {} as Record<string, RawState> })
    ),
  ])
  return ctx.markets
    .filter((m) => m.config.is_open)
    .map((m) => {
      const s = ticker.d[String(m.id)] ?? m.state
      const dp = m.config.price_decimals
      const price = s.mrk / 10 ** dp
      const prev = s.prv / 10 ** dp
      const funding = m.funding ? m.funding.rate / 1e6 : 0
      return {
        id: m.id,
        symbol: (m.size_units || m.symbol || m.name).toUpperCase(),
        price,
        change24hPct: prev ? ((price - prev) / prev) * 100 : 0,
        fundingPctPerHour: m.funding_interval_sec
          ? ((funding * 3600) / m.funding_interval_sec) * 100
          : 0,
        openInterestUsd: (s.oi / 10 ** m.config.size_decimals) * price,
        tvlUsd: usd(s.tvl ?? 0),
        volume24hUsd: usd(s.dva ?? 0),
        maxLeverage: m.config.initial_margin / 100,
        mmr: 100 / m.config.maintenance_margin,
        takerFeePct: m.config.taker_fee / 1e4,
        priceDecimals: dp,
        sizeDecimals: m.config.size_decimals,
      }
    })
    .sort((a, b) => b.openInterestUsd - a.openInterestUsd)
}

export type WalletPosition = {
  symbol: string
  side: "long" | "short"
  entry: number
  mark: number
  size: number
  notionalUsd: number
  collateralUsd: number
  leverage: number
  pnlUsd: number
  autoClosePrice: number
  distancePct: number // % price move left before auto-close
  fractionLeft: number // 0..1 of the original entry→auto-close distance
}

export type Wallet = {
  address: Address
  accountId: string | null
  freeUsd: number
  positions: WalletPosition[]
  error?: string
}

export async function loadWallet(
  input: string,
  markets: MarketRow[]
): Promise<Wallet | null> {
  const raw = input.trim()
  if (!raw) return null
  if (!isAddress(raw))
    return {
      address: raw as Address,
      accountId: null,
      freeUsd: 0,
      positions: [],
      error: "That isn’t a valid 0x address.",
    }
  const address = getAddress(raw)
  let account
  try {
    account = await client.readContract({
      address: EXCHANGE,
      abi: ABI,
      functionName: "getAccountByAddr",
      args: [address],
    })
  } catch {
    return {
      address,
      accountId: null,
      freeUsd: 0,
      positions: [],
      error: "No Perpl account for this address yet.",
    }
  }
  const results = await Promise.all(
    markets.map((m) =>
      client
        .readContract({
          address: EXCHANGE,
          abi: ABI,
          functionName: "getPosition",
          args: [BigInt(m.id), account.accountId],
        })
        .then(([p]) => ({ m, p }))
        .catch(() => null)
    )
  )
  const positions = results
    .filter((r): r is NonNullable<typeof r> => r !== null && r.p.lotLNS > 0n)
    .map(({ m, p }) => {
      const side = p.positionType === 0 ? "long" : "short"
      const entry = Number(p.pricePNS) / 10 ** m.priceDecimals
      const size = Number(p.lotLNS) / 10 ** m.sizeDecimals
      const collateralUsd = usd(p.depositCNS)
      const notionalUsd = entry * size
      const dist = Math.max(collateralUsd / notionalUsd - m.mmr, 0)
      const autoClosePrice =
        side === "long" ? entry * (1 - dist) : entry * (1 + dist)
      const pnlUsd =
        (side === "long" ? m.price - entry : entry - m.price) * size
      const left =
        side === "long" ? m.price - autoClosePrice : autoClosePrice - m.price
      const total = Math.abs(entry - autoClosePrice)
      return {
        symbol: m.symbol,
        side,
        entry,
        mark: m.price,
        size,
        notionalUsd,
        collateralUsd,
        leverage: collateralUsd > 0 ? notionalUsd / collateralUsd : 0,
        pnlUsd,
        autoClosePrice,
        distancePct: (Math.abs(m.price - autoClosePrice) / m.price) * 100,
        fractionLeft: total ? Math.min(Math.max(left / total, 0), 1) : 0,
      } satisfies WalletPosition
    })
  return {
    address,
    accountId: account.accountId.toString(),
    freeUsd: usd(account.balanceCNS),
    positions,
  }
}
