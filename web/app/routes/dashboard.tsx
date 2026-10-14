import { useEffect, useMemo, useState } from "react"
import { Form, useRevalidator } from "react-router"
import type { Route } from "./+types/dashboard"
import {
  loadMarkets,
  loadWallet,
  type MarketRow,
  type WalletPosition,
} from "~/lib/perpl.server"

const REFRESH_MS = 5_000
const SAMPLE = "0xf91b2eCb1cD59A36F3AED20B46943a75dB08795b" // a live Perpl account, for demos

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Pocket Risk · Perpl dashboard" },
    {
      name: "description",
      content:
        "Live Perpl markets plus any wallet's positions, auto-close prices and max-loss sizing.",
    },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const address = new URL(request.url).searchParams.get("address") ?? ""
  try {
    const markets = await loadMarkets()
    const wallet = await loadWallet(address, markets)
    return {
      markets,
      wallet,
      address,
      at: Date.now(),
      error: null as string | null,
    }
  } catch {
    // Perpl or the RPC hiccuped: render the page and let the 5s refresh retry.
    return {
      markets: [] as MarketRow[],
      wallet: null,
      address,
      at: Date.now(),
      error: "Couldn’t reach Perpl. Retrying…",
    }
  }
}

// ---------- formatting ----------
const usd = (v: number, digits = 2) =>
  `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
const compact = (v: number) =>
  `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v)}`
const price = (v: number) =>
  `$${v.toLocaleString("en-US", { maximumFractionDigits: v >= 1000 ? 0 : v >= 1 ? 2 : 5 })}`
const pct = (v: number, digits = 2) =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}%`
const tone = (v: number) =>
  v > 0 ? "text-[#2FE39A]" : v < 0 ? "text-[#FF5A5F]" : "text-[#F5F3EC]"

function level(f: number) {
  return f > 0.5
    ? { label: "safe", bar: "bg-[#2FE39A]", text: "text-[#2FE39A]" }
    : f >= 0.2
      ? { label: "watch", bar: "bg-[#FFB547]", text: "text-[#FFB547]" }
      : {
          label: "close to auto-close",
          bar: "bg-[#FF5A5F]",
          text: "text-[#FF5A5F]",
        }
}

// ---------- page ----------
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { markets, wallet, address, at, error } = loaderData
  const revalidator = useRevalidator()

  useEffect(() => {
    const t = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        revalidator.state === "idle"
      )
        void revalidator.revalidate()
    }, REFRESH_MS)
    return () => clearInterval(t)
  }, [revalidator])

  const totals = useMemo(
    () => ({
      oi: markets.reduce((s, m) => s + m.openInterestUsd, 0),
      tvl: markets.reduce((s, m) => s + m.tvlUsd, 0),
      vol: markets.reduce((s, m) => s + m.volume24hUsd, 0),
    }),
    [markets]
  )

  return (
    <main className="min-h-svh bg-[#0F1115] px-4 py-8 text-[#F5F3EC] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <a href="/" className="text-sm text-[#2FE39A] underline">
              ← Pocket
            </a>
            <h1 className="mt-2 text-3xl font-semibold">Pocket Risk</h1>
            <p className="text-[#9AA0AA]">
              Live Perpl risk on Monad: every market, any wallet, and how much
              you can lose before you trade.
            </p>
          </div>
          <p className="text-xs text-[#9AA0AA]">
            {revalidator.state === "loading"
              ? "Refreshing…"
              : `Updated ${new Date(at).toLocaleTimeString()}`}{" "}
            · every 5s
          </p>
        </header>

        {error && (
          <p className="rounded-xl bg-[#FFB547]/15 px-4 py-2 text-sm text-[#FFB547]">
            {error}
          </p>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Open interest" value={compact(totals.oi)} />
          <Stat label="TVL" value={compact(totals.tvl)} />
          <Stat label="24h volume" value={compact(totals.vol)} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Protocol · markets</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#2A2D35]">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#171A21] text-left text-xs text-[#9AA0AA] uppercase">
                <tr>
                  {[
                    "Market",
                    "Mark",
                    "24h",
                    "Funding /h",
                    "Open interest",
                    "TVL",
                    "Max lev.",
                    "Maint. margin",
                    "Taker fee",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {markets.map((m) => (
                  <tr key={m.id} className="border-t border-[#2A2D35]">
                    <td className="px-3 py-2 font-semibold">{m.symbol}</td>
                    <td className="px-3 py-2">{price(m.price)}</td>
                    <td className={`px-3 py-2 ${tone(m.change24hPct)}`}>
                      {pct(m.change24hPct)}
                    </td>
                    <td className="px-3 py-2 text-[#9AA0AA]">
                      {m.fundingPctPerHour >= 0 ? "longs pay " : "shorts pay "}
                      {Math.abs(m.fundingPctPerHour).toFixed(4)}%
                    </td>
                    <td className="px-3 py-2">{compact(m.openInterestUsd)}</td>
                    <td className="px-3 py-2">{compact(m.tvlUsd)}</td>
                    <td className="px-3 py-2">{m.maxLeverage}×</td>
                    <td className="px-3 py-2">{(m.mmr * 100).toFixed(2)}%</td>
                    <td className="px-3 py-2">{m.takerFeePct.toFixed(4)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wallet · positions</h2>
          <Form method="get" className="flex flex-col gap-2 sm:flex-row">
            <input
              name="address"
              defaultValue={address}
              placeholder="0x… any Monad address"
              aria-label="Wallet address"
              className="h-11 flex-1 rounded-xl border border-[#2A2D35] bg-[#171A21] px-3 font-mono text-sm outline-none focus:border-[#2FE39A]"
            />
            <button className="h-11 rounded-xl bg-[#2FE39A] px-5 font-semibold text-[#0F1115]">
              Check risk
            </button>
            <a
              href={`?address=${SAMPLE}`}
              className="flex h-11 items-center px-2 text-sm text-[#7C5CFF] underline"
            >
              Try a live account
            </a>
          </Form>
          {wallet && <WalletView wallet={wallet} />}
        </section>

        <MaxLossCalculator markets={markets} />

        <footer className="pb-6 text-xs text-[#9AA0AA]">
          Data: Perpl public API + Monad mainnet (Perpl Exchange 0x34B6…2a6F).
          Auto-close price ≈ entry × (1 ∓ (collateral / notional − maintenance
          margin)).
        </footer>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#2A2D35] bg-[#171A21] p-4">
      <p className="text-xs text-[#9AA0AA] uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function WalletView({
  wallet,
}: {
  wallet: NonNullable<Route.ComponentProps["loaderData"]["wallet"]>
}) {
  if (wallet.error)
    return <p className="text-sm text-[#FFB547]">{wallet.error}</p>
  const atRisk = wallet.positions.reduce((s, p) => s + p.collateralUsd, 0)
  const upnl = wallet.positions.reduce((s, p) => s + p.pnlUsd, 0)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Perpl account" value={`#${wallet.accountId}`} />
        <Stat label="At risk (position collateral)" value={usd(atRisk)} />
        <Stat label="Free (not at risk)" value={usd(wallet.freeUsd)} />
        <div className="rounded-2xl border border-[#2A2D35] bg-[#171A21] p-4">
          <p className="text-xs text-[#9AA0AA] uppercase">Unrealised P&L</p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${tone(upnl)}`}
          >
            {usd(upnl)}
          </p>
        </div>
      </div>
      {wallet.positions.length === 0 ? (
        <p className="text-sm text-[#9AA0AA]">No open positions.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {wallet.positions.map((p) => (
            <PositionCard key={p.symbol} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function PositionCard({ p }: { p: WalletPosition }) {
  const l = level(p.fractionLeft)
  return (
    <div className="space-y-3 rounded-2xl border border-[#2A2D35] bg-[#171A21] p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {p.symbol}{" "}
          <span
            className={p.side === "long" ? "text-[#2FE39A]" : "text-[#FF5A5F]"}
          >
            {p.side === "long" ? "Up" : "Down"}
          </span>{" "}
          <span className="text-[#9AA0AA]">· {p.leverage.toFixed(1)}×</span>
        </p>
        <p className={`text-lg font-semibold tabular-nums ${tone(p.pnlUsd)}`}>
          {usd(p.pnlUsd)}
        </p>
      </div>
      <p className="text-sm text-[#F5F3EC]">
        If {p.symbol} {p.side === "long" ? "falls" : "rises"} to about{" "}
        <b>{price(p.autoClosePrice)}</b> (
        {pct(p.side === "long" ? -p.distancePct : p.distancePct, 1)} from now),
        this position auto-closes and loses its <b>{usd(p.collateralUsd)}</b>{" "}
        collateral.
      </p>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2A2D35]">
          <div
            className={`h-full rounded-full ${l.bar}`}
            style={{ width: `${Math.max(p.fractionLeft, 0.02) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${l.text}`}>{l.label}</span>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs tabular-nums">
        <Item k="Entry" v={price(p.entry)} />
        <Item k="Mark" v={price(p.mark)} />
        <Item k="Notional" v={usd(p.notionalUsd)} />
      </dl>
    </div>
  )
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[#9AA0AA]">{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

function MaxLossCalculator({ markets }: { markets: MarketRow[] }) {
  const [symbol, setSymbol] = useState(markets[0]?.symbol ?? "BTC")
  const [risk, setRisk] = useState(5)
  const [k, setK] = useState(5)
  const [side, setSide] = useState<"long" | "short">("long")
  const m = markets.find((x) => x.symbol === symbol) ?? markets[0]
  if (!m) return null
  const kUsed = Math.min(k, m.maxLeverage)
  const notional = risk * kUsed
  const dist = Math.max(1 / kUsed - m.mmr, 0)
  const autoClose =
    side === "long" ? m.price * (1 - dist) : m.price * (1 + dist)
  const fee = notional * (m.takerFeePct / 100)

  return (
    <section className="space-y-3 rounded-2xl border border-[#2A2D35] bg-[#171A21] p-5">
      <h2 className="text-lg font-semibold">Max-loss sizing</h2>
      <div className="flex flex-wrap gap-2 text-sm">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          aria-label="Market"
          className="h-10 rounded-lg border border-[#2A2D35] bg-[#0F1115] px-2"
        >
          {markets.map((x) => (
            <option key={x.id}>{x.symbol}</option>
          ))}
        </select>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "long" | "short")}
          aria-label="Direction"
          className="h-10 rounded-lg border border-[#2A2D35] bg-[#0F1115] px-2"
        >
          <option value="long">Up</option>
          <option value="short">Down</option>
        </select>
        <label className="flex items-center gap-1">
          Risk $
          <input
            type="number"
            min={1}
            value={risk}
            onChange={(e) => setRisk(Math.max(1, Number(e.target.value) || 1))}
            className="h-10 w-20 rounded-lg border border-[#2A2D35] bg-[#0F1115] px-2"
          />
        </label>
        {[2, 5, 10].map((x) => (
          <button
            key={x}
            type="button"
            disabled={x > m.maxLeverage}
            onClick={() => setK(x)}
            className={`h-10 rounded-lg px-3 disabled:opacity-30 ${kUsed === x ? "bg-[#2FE39A] text-[#0F1115]" : "border border-[#2A2D35]"}`}
          >
            {x === 2 ? "Calm" : x === 5 ? "Bold" : "Wild"} {x}×
          </button>
        ))}
      </div>
      <p className="text-base">
        You&apos;d trade <b>{usd(notional)}</b> of {m.symbol}. If {m.symbol}{" "}
        {side === "long" ? "falls" : "rises"} to about <b>{price(autoClose)}</b>{" "}
        ({pct(side === "long" ? -dist * 100 : dist * 100, 1)}), the trade closes
        and you lose <b className="text-[#FF5A5F]">{usd(risk)}</b>. That&apos;s
        the most you can lose. Fee to open ≈ {usd(fee, 3)}.
      </p>
    </section>
  )
}
