// Demo account: paper trading against live Perpl mark prices.
// Same risk math as live (lib/risk.ts), real taker fees, and auto-close at the auto-close price.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { useMarkets } from '@/hooks/useMarkets';
import { pnlUsd, sizeTrade, type Multiplier, type Side } from './risk';
import type { Market, Position, Trade } from './types';
import { KEYS, loadJson, saveJson } from './persist';

export const DEMO_START_USD = 1000;
const DEMO_SLIPPAGE = 0.0005; // 0.05% worse than mark, like a real market order

type State = { balance: number; positions: Position[]; trades: Trade[] };
type Action =
  | { type: 'open'; position: Position; cost: number }
  | { type: 'close'; id: string; credit: number; trade: Trade }
  | { type: 'reset' }
  | { type: 'hydrate'; state: State };

const initial: State = { balance: DEMO_START_USD, positions: [], trades: [] };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'open':
      return { ...s, balance: s.balance - a.cost, positions: [a.position, ...s.positions] };
    case 'close':
      return {
        balance: s.balance + a.credit,
        positions: s.positions.filter((p) => p.id !== a.id),
        trades: [a.trade, ...s.trades],
      };
    case 'reset':
      return initial;
    case 'hydrate':
      return a.state;
  }
}

/** Settle a position at `exitPrice`. Loss is capped at the amount at risk. */
function settle(p: Position, exitPrice: number, market: Market | undefined, autoClosed: boolean) {
  const gross = Math.max(
    pnlUsd({ entry: p.entryPrice, mark: exitPrice, size: p.size, side: p.side }),
    -p.riskUsd
  );
  const closeFee = autoClosed ? 0 : p.size * exitPrice * (market?.takerFeeRate ?? 0);
  const credit = Math.max(p.riskUsd + gross - closeFee, 0);
  const openFee = p.openFee ?? 0;
  const trade: Trade = {
    id: p.id,
    symbol: p.symbol,
    side: p.side,
    k: p.k,
    riskUsd: p.riskUsd,
    pnlUsd: credit - p.riskUsd - openFee,
    openedAt: p.openedAt,
    closedAt: Date.now(),
    settleMs: 0,
    autoClosed,
    demo: true,
  };
  return { credit, trade };
}

type DemoContext = State & {
  open: (p: { market: Market; side: Side; riskUsd: number; k: Multiplier }) => Position;
  close: (id: string) => Trade | undefined;
  reset: () => void;
};

const Ctx = createContext<DemoContext | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [hydrated, setHydrated] = useState(false);

  // Restore the demo account from the last session, then save on every change.
  useEffect(() => {
    loadJson<State>(KEYS.demo).then((saved) => {
      if (saved && typeof saved.balance === 'number') dispatch({ type: 'hydrate', state: saved });
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (hydrated) saveJson(KEYS.demo, { ...state, trades: state.trades.slice(0, 100) });
  }, [hydrated, state]);
  const { markets } = useMarkets();
  const bySymbol = useMemo(() => new Map(markets.map((m) => [m.symbol, m])), [markets]);

  // Auto-close: if the live mark crosses a position's auto-close price, it closes at a full loss.
  useEffect(() => {
    for (const p of state.positions) {
      const m = bySymbol.get(p.symbol);
      if (!m) continue;
      const hit = p.side === 'long' ? m.price <= p.autoClosePrice : m.price >= p.autoClosePrice;
      if (hit) {
        const { credit, trade } = settle(p, p.autoClosePrice, m, true);
        dispatch({ type: 'close', id: p.id, credit, trade });
      }
    }
  }, [bySymbol, state.positions]);

  const open: DemoContext['open'] = useCallback(({ market, side, riskUsd, k }) => {
    const entry = market.price * (side === 'long' ? 1 + DEMO_SLIPPAGE : 1 - DEMO_SLIPPAGE);
    const t = sizeTrade({
      riskUsd,
      k,
      markPrice: entry,
      side,
      mmr: market.mmr,
      takerFeeRate: market.takerFeeRate,
    });
    const position: Position = {
      id: `demo-${Date.now().toString(36)}`,
      symbol: market.symbol,
      side,
      k,
      riskUsd,
      entryPrice: entry,
      size: t.size,
      autoClosePrice: t.autoClosePrice,
      openedAt: Date.now(),
      openFee: t.openFee,
    };
    dispatch({ type: 'open', position, cost: riskUsd + t.openFee });
    return position;
  }, []);

  const close: DemoContext['close'] = useCallback(
    (id) => {
      const p = state.positions.find((x) => x.id === id);
      if (!p) return undefined;
      const m = bySymbol.get(p.symbol);
      const { credit, trade } = settle(p, m?.price ?? p.entryPrice, m, false);
      dispatch({ type: 'close', id, credit, trade });
      return trade;
    },
    [bySymbol, state.positions]
  );

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return <Ctx.Provider value={{ ...state, open, close, reset }}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
