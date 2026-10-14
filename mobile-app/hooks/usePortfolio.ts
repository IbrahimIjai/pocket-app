import { useDemo } from '@/lib/demo';
import { useMode } from '@/lib/mode';
import type { Balances, Position, Trade } from '@/lib/types';

const EMPTY_BALANCES: Balances = { pocketUsd: 0, inTradesUsd: 0, mon: 0 };
const NONE: never[] = [];

/**
 * One source for balances, positions and history, whichever mode is on.
 * Live mode is empty until Phase 4 (balances) and Phase 6 (positions) land.
 */
export function usePortfolio(): {
  mode: 'demo' | 'live';
  balances: Balances;
  positions: Position[];
  trades: Trade[];
  canTrade: boolean;
} {
  const { mode } = useMode();
  const demo = useDemo();

  if (mode === 'demo') {
    return {
      mode,
      balances: {
        pocketUsd: demo.balance,
        inTradesUsd: demo.positions.reduce((s, p) => s + p.riskUsd, 0),
        mon: 0,
      },
      positions: demo.positions,
      trades: demo.trades,
      canTrade: true,
    };
  }
  return { mode, balances: EMPTY_BALANCES, positions: NONE, trades: NONE, canTrade: false };
}
