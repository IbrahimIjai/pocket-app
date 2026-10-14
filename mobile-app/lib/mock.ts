// Static demo data for Phase 1. Delete usages in Phase 6 (step 6.6).
import { sizeTrade } from './risk';
import type { Balances, Market, Position, Trade } from './types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const now = Date.now();

export const MOCK_MARKETS: Market[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    marketId: 1,
    price: 103_360,
    change24hPct: 3.4,
    fundingPctPerHour: 0.01,
    maxLeverage: 20,
    mmr: 0.005,
    takerFeeRate: 0.0004,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    marketId: 20,
    price: 3_912,
    change24hPct: -0.6,
    fundingPctPerHour: 0.008,
    maxLeverage: 20,
    mmr: 0.005,
    takerFeeRate: 0.0004,
  },
  {
    symbol: 'MON',
    name: 'Monad',
    marketId: 10,
    price: 0.0412,
    change24hPct: 4.1,
    fundingPctPerHour: -0.004,
    maxLeverage: 10,
    mmr: 0.01,
    takerFeeRate: 0.0004,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    marketId: 31,
    price: 201.4,
    change24hPct: 0.9,
    fundingPctPerHour: 0.006,
    maxLeverage: 20,
    mmr: 0.005,
    takerFeeRate: 0.0004,
  },
];

const btcEntry = 100_000;
const btcSized = sizeTrade({
  riskUsd: 5,
  k: 5,
  markPrice: btcEntry,
  side: 'long',
  mmr: 0.005,
  takerFeeRate: 0.0004,
});

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'mock-btc-1',
    symbol: 'BTC',
    side: 'long',
    k: 5,
    riskUsd: 5,
    entryPrice: btcEntry,
    size: btcSized.size,
    autoClosePrice: btcSized.autoClosePrice,
    openedAt: now - 2 * MIN,
    openTx: '0x91a3c0ffee00000000000000000000000000000000000000000000000000e2',
  },
];

export const MOCK_TRADES: Trade[] = [
  {
    id: 't3',
    symbol: 'ETH',
    side: 'short',
    k: 2,
    riskUsd: 10,
    pnlUsd: 1.62,
    openedAt: now - 5 * HOUR,
    closedAt: now - 4 * HOUR,
    settleMs: 820,
  },
  {
    id: 't2',
    symbol: 'BTC',
    side: 'long',
    k: 5,
    riskUsd: 5,
    pnlUsd: -5,
    openedAt: now - 26 * HOUR,
    closedAt: now - 20 * HOUR,
    settleMs: 760,
  },
  {
    id: 't1',
    symbol: 'MON',
    side: 'long',
    k: 10,
    riskUsd: 25,
    pnlUsd: 7.4,
    openedAt: now - 50 * HOUR,
    closedAt: now - 49 * HOUR,
    settleMs: 910,
  },
];

export const MOCK_BALANCES: Balances = { pocketUsd: 142.8, inTradesUsd: 5, mon: 0.42 };

export const MOCK_ADDRESS = '0x8F3e9b2C4a7D1f6E0b5C3a9D8e7F6a5B4c3Da21c' as const;

export function mockMarket(symbol: string) {
  return MOCK_MARKETS.find((m) => m.symbol === symbol.toUpperCase());
}

/** Deterministic fake close prices ending at the market's current price. */
export function mockSeries(symbol: string, points = 60) {
  const market = mockMarket(symbol);
  if (!market) return [];
  let seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: number[] = [market.price];
  for (let i = 1; i < points; i++) {
    out.unshift(out[0] * (1 + (rand() - 0.5) * 0.02));
  }
  return out;
}
