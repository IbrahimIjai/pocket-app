/// <reference types="bun" />
import { expect, test } from 'bun:test';
import { summarize, type SmartMoney } from './nansen';

const base: SmartMoney = {
  symbol: 'BTC',
  lookbackHours: 24,
  longOpenedUsd: 0,
  shortOpenedUsd: 0,
  longClosedUsd: 0,
  shortClosedUsd: 0,
  traders: 3,
  trades: 10,
  bias: 'neutral',
  top: [],
};

test('summaries read naturally', () => {
  expect(
    summarize({ ...base, longOpenedUsd: 5_200_000, shortOpenedUsd: 1_000_000, bias: 'long' })
  ).toBe('Smart traders added $4.2M more longs than shorts on BTC in the last 24h.');
  expect(
    summarize({ ...base, longOpenedUsd: 100_000, shortOpenedUsd: 900_000, bias: 'short' })
  ).toContain('more shorts than longs');
  expect(summarize({ ...base, longOpenedUsd: 1_000_000, shortOpenedUsd: 950_000 })).toContain(
    'are split'
  );
  expect(summarize({ ...base, trades: 0 })).toContain('No smart-money BTC trades');
});
