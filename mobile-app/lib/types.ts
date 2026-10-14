// App-level domain types. Screens depend on these, never on raw Perpl API shapes,
// so Phase 2/6 only swap the data source (lib/mock.ts → live hooks).
import type { Multiplier, Side } from './risk';

export type { Multiplier, Side };

export type Market = {
  symbol: string; // 'BTC'
  name: string; // 'Bitcoin'
  marketId: number; // Perpl market id (resolved from /v1/pub/context by symbol)
  priceDecimals?: number; // Perpl scaling: present on live data
  sizeDecimals?: number;
  price: number; // mark price, USD
  change24hPct: number;
  fundingPctPerHour: number; // positive = longs pay
  maxLeverage: number; // 1 / initial_margin
  mmr: number; // maintenance margin ratio
  takerFeeRate: number;
};

export type Position = {
  id: string;
  symbol: string;
  side: Side;
  k: Multiplier;
  riskUsd: number;
  entryPrice: number;
  size: number; // base units
  autoClosePrice: number;
  openedAt: number; // ms
  openFee?: number; // USD paid to open
  openTx?: `0x${string}`;
};

export type Trade = {
  id: string;
  symbol: string;
  side: Side;
  k: Multiplier;
  riskUsd: number;
  pnlUsd: number;
  openedAt: number;
  closedAt: number;
  settleMs?: number;
  autoClosed?: boolean; // hit the auto-close price
  demo?: boolean; // paper trade
  indexed?: boolean; // from the Envio indexer
  openTx?: `0x${string}`;
  closeTx?: `0x${string}`;
};

export type Balances = {
  pocketUsd: number; // AUSD in the wallet: can't be liquidated
  inTradesUsd: number; // collateral inside Perpl
  mon: number; // native gas token
};
