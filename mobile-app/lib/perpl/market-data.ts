// Read-only Perpl REST client. Native apps have no CORS, so no proxy (plan D2).
import { config } from '@/lib/config';
import type { Market } from '@/lib/types';
import type { CandleSeries, Context, MarketState, PerplMarket, Ticker } from './types';
import { maxLeverageFrom, microsToRate, mmrFrom, scalePrice } from './units';

const NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  MON: 'Monad',
  SOL: 'Solana',
  HYPE: 'Hyperliquid',
  ZEC: 'Zcash',
  NEAR: 'NEAR',
  UNI: 'Uniswap',
  PUMP: 'Pump',
  LIT: 'Lighter',
  VVV: 'Venice',
};

/** Markets shown first, in this order; the rest follow. */
export const FEATURED = ['BTC', 'ETH', 'MON', 'SOL'];

export class PerplHttpError extends Error {
  constructor(public status: number) {
    super(`Perpl API ${status}`);
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${config.perplApiUrl}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new PerplHttpError(res.status);
  return res.json() as Promise<T>;
}

export const getContext = () => get<Context>('/v1/pub/context');
export const getTicker = () => get<Ticker>('/v1/market-data/ticker');
export const getCandles = (marketId: number, resolution: number, from: number, to: number) =>
  get<CandleSeries>(`/v1/market-data/${marketId}/candles/${resolution}/${from}-${to}`);

export const symbolOf = (m: PerplMarket) => (m.size_units || m.symbol || m.name).toUpperCase();

/** Map an API market (+ optional fresher ticker state) to the app's Market type. */
export function toMarket(m: PerplMarket, state: MarketState = m.state): Market {
  const dp = m.config.price_decimals;
  const price = scalePrice(state.mrk, dp);
  const prev = scalePrice(state.prv, dp);
  const symbol = symbolOf(m);
  // Funding `rate` units aren't documented; treated as micros per funding interval (unverified).
  const fundingRate = m.funding ? microsToRate(m.funding.rate) : 0;
  const perHour = m.funding_interval_sec ? (fundingRate * 3600) / m.funding_interval_sec : 0;
  return {
    symbol,
    name: NAMES[symbol] ?? symbol,
    marketId: m.id,
    priceDecimals: dp,
    sizeDecimals: m.config.size_decimals,
    price,
    change24hPct: prev ? ((price - prev) / prev) * 100 : 0,
    fundingPctPerHour: perHour * 100,
    maxLeverage: maxLeverageFrom(m.config.initial_margin),
    mmr: mmrFrom(m.config.maintenance_margin),
    takerFeeRate: microsToRate(m.config.taker_fee),
  };
}

export function sortMarkets(markets: Market[]) {
  const rank = (s: string) => {
    const i = FEATURED.indexOf(s);
    return i === -1 ? FEATURED.length : i;
  };
  return [...markets].sort((a, b) => rank(a.symbol) - rank(b.symbol));
}

/** Timeframe → candle resolution (seconds) and lookback window (ms). ≤1024 candles each. */
export const TIMEFRAMES = {
  '1H': { resolution: 60, windowMs: 60 * 60_000 },
  '1D': { resolution: 900, windowMs: 24 * 3_600_000 },
  '1W': { resolution: 7200, windowMs: 7 * 86_400_000 },
  '1M': { resolution: 28800, windowMs: 30 * 86_400_000 },
} as const;
export type Timeframe = keyof typeof TIMEFRAMES;
