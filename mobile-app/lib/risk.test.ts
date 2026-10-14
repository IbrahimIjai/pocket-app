/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { pnlUsd, riskMeter, sizeTrade } from './risk';

describe('sizeTrade', () => {
  // POCKET.md §2 example: BTC $100,000, $5 at risk, Bold 5×, mmr 0.5%.
  const t = sizeTrade({
    riskUsd: 5,
    k: 5,
    markPrice: 100_000,
    side: 'long',
    mmr: 0.005,
    takerFeeRate: 0.0004,
  });

  test('notional and size', () => {
    expect(t.notional).toBe(25);
    expect(t.size).toBeCloseTo(0.00025, 10);
  });

  test('auto-close ≈ $80,500 (−19.5%)', () => {
    expect(t.autoClosePrice).toBeCloseTo(80_500, 6);
    expect(t.autoCloseMovePct).toBeCloseTo(19.5, 6);
  });

  test('fee and max loss', () => {
    expect(t.openFee).toBeCloseTo(0.01, 10);
    expect(t.maxLoss).toBe(5);
  });

  test('short auto-close sits above entry', () => {
    const s = sizeTrade({
      riskUsd: 5,
      k: 5,
      markPrice: 100_000,
      side: 'short',
      mmr: 0.005,
      takerFeeRate: 0,
    });
    expect(s.autoClosePrice).toBeCloseTo(119_500, 6);
  });
});

describe('riskMeter', () => {
  const base = { entry: 100_000, autoClose: 80_500, side: 'long' as const };

  test('at entry is fully safe', () => {
    expect(riskMeter({ ...base, mark: 100_000 })).toEqual({ fractionLeft: 1, level: 'safe' });
  });

  test('thresholds', () => {
    expect(riskMeter({ ...base, mark: 90_250 }).level).toBe('watch'); // 50% left
    expect(riskMeter({ ...base, mark: 82_000 }).level).toBe('danger'); // ~7.7% left
  });

  test('clamped at auto-close', () => {
    expect(riskMeter({ ...base, mark: 70_000 }).fractionLeft).toBe(0);
  });
});

test('pnlUsd', () => {
  expect(pnlUsd({ entry: 100_000, mark: 103_360, size: 0.00025, side: 'long' })).toBeCloseTo(
    0.84,
    10
  );
  expect(pnlUsd({ entry: 100_000, mark: 103_360, size: 0.00025, side: 'short' })).toBeCloseTo(
    -0.84,
    10
  );
});
