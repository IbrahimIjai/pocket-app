// Risk engine — "max loss first". See pocket_drafts/POCKET.md §2.
// Pure functions only: no React, no network, so it can be unit-tested with `bun test`.

export type Multiplier = 2 | 5 | 10;
export type Side = 'long' | 'short';
export type RiskLevel = 'safe' | 'watch' | 'danger';

export const BOLDNESS: { k: Multiplier; label: string }[] = [
  { k: 2, label: 'Calm' },
  { k: 5, label: 'Bold' },
  { k: 10, label: 'Wild' },
];

export const RISK_PRESETS_USD = [5, 10, 25] as const;

export function sizeTrade(p: {
  riskUsd: number; // L — the most the user can lose
  k: Multiplier;
  markPrice: number;
  side: Side;
  mmr: number; // maintenance margin ratio, e.g. 0.005
  takerFeeRate: number; // e.g. 0.0004
}) {
  const notional = p.riskUsd * p.k;
  const size = notional / p.markPrice;
  const dist = Math.max(1 / p.k - p.mmr, 0);
  const autoClosePrice = p.side === 'long' ? p.markPrice * (1 - dist) : p.markPrice * (1 + dist);
  return {
    margin: p.riskUsd,
    notional,
    size,
    autoClosePrice,
    autoCloseMovePct: dist * 100,
    openFee: notional * p.takerFeeRate,
    maxLoss: p.riskUsd,
  };
}

export type SizedTrade = ReturnType<typeof sizeTrade>;

/**
 * How much of the distance between entry and auto-close is still left.
 * 1 = at entry (or in profit), 0 = at the auto-close price.
 */
export function riskMeter(p: { entry: number; mark: number; autoClose: number; side: Side }) {
  const total = Math.abs(p.entry - p.autoClose);
  const left = p.side === 'long' ? p.mark - p.autoClose : p.autoClose - p.mark;
  const fractionLeft = total === 0 ? 0 : Math.min(Math.max(left / total, 0), 1);
  const level: RiskLevel = fractionLeft > 0.5 ? 'safe' : fractionLeft >= 0.2 ? 'watch' : 'danger';
  return { fractionLeft, level };
}

/** Unrealised P&L in USD for a position of `size` base units. */
export function pnlUsd(p: { entry: number; mark: number; size: number; side: Side }) {
  const diff = p.side === 'long' ? p.mark - p.entry : p.entry - p.mark;
  return diff * p.size;
}
