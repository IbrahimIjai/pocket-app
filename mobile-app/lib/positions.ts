import { pnlUsd, riskMeter } from './risk';
import type { Position } from './types';

/** Everything the UI shows about an open trade, given the current mark price. */
export function positionStats(p: Position, mark: number) {
  // Losses can't exceed what's at risk: the position auto-closes there.
  const pnl = Math.max(
    pnlUsd({ entry: p.entryPrice, mark, size: p.size, side: p.side }),
    -p.riskUsd
  );
  return {
    pnl,
    pnlPctOfRisk: (pnl / p.riskUsd) * 100,
    meter: riskMeter({ entry: p.entryPrice, mark, autoClose: p.autoClosePrice, side: p.side }),
  };
}
