// Perpl public API shapes (subset). Source: github.com/PerplFoundation/api-docs types.md.
// Screens never import these: map to lib/types.ts via lib/perpl/market-data.ts.

export type BlockTimestamp = { b?: number; t?: number };

export type ProtocolInstance = {
  id: number;
  address: string;
  collateral_token_id: number;
  min_account_open_amount: string; // collateral token units (AUSD 6dp)
  min_deposit_amount: string;
  min_withdraw_amount: string;
};

export type Token = { id?: number; address?: string; symbol: string; decimals: number };

export type MarketConfig = {
  is_open: boolean;
  price_decimals: number;
  size_decimals: number;
  initial_margin: number; // max leverage × 100 (1500 = 15×)
  maintenance_margin: number; // maintenance leverage × 100 (2500 → mmr 4%)
  taker_fee: number; // micros
  maker_fee: number; // micros
};

export type MarketState = {
  at: BlockTimestamp;
  orl: number; // oracle
  mrk: number; // mark
  lst: number; // last
  bid: number;
  ask: number;
  prv: number; // 24h ago
};

export type FundingEvent = { at: BlockTimestamp; rate: number };

export type PerplMarket = {
  id: number;
  perpetual_id: number;
  symbol: string; // sometimes empty: use size_units
  name: string;
  size_units: string;
  funding_interval_sec: number;
  order_max_market_slippage_bps: number;
  config: MarketConfig;
  state: MarketState;
  funding?: FundingEvent;
};

export type Context = {
  instances: ProtocolInstance[];
  tokens: Token[];
  markets: PerplMarket[];
};

export type Ticker = { mt: 9; sn: number; d: Record<string, MarketState> };

export type Candle = {
  t: number;
  o: number;
  c: number;
  h: number;
  l: number;
  v: string;
  n: number;
};
export type CandleSeries = { mt: number; r: number; d: Candle[] };
