// Local journal of live trades (POCKET.md §3 S8). Phase 8 can replace it with Envio.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { KEYS, loadJson, saveJson } from './persist';
import type { Multiplier, Side, Trade } from './types';

/** What we know about an open live trade that the chain doesn't tell us. */
export type OpenEntry = {
  positionId: string; // `live-${perpId}`
  symbol: string;
  side: Side;
  k: Multiplier;
  riskUsd: number;
  openedAt: number;
  openTx?: `0x${string}`;
  settleMs?: number;
};

type JournalState = { open: OpenEntry[]; trades: Trade[] };

type JournalContext = JournalState & {
  recordOpen: (e: OpenEntry) => void;
  recordClose: (t: Trade) => void;
};

const EMPTY: JournalState = { open: [], trades: [] };
const Ctx = createContext<JournalContext | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JournalState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadJson<JournalState>(KEYS.journal).then((saved) => {
      if (saved?.trades) setState(saved);
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (hydrated) saveJson(KEYS.journal, { ...state, trades: state.trades.slice(0, 200) });
  }, [hydrated, state]);

  const recordOpen = useCallback((e: OpenEntry) => {
    setState((s) => ({
      ...s,
      open: [e, ...s.open.filter((x) => x.positionId !== e.positionId)],
    }));
  }, []);
  const recordClose = useCallback((t: Trade) => {
    setState((s) => ({
      open: s.open.filter((x) => x.positionId !== t.id),
      trades: [t, ...s.trades],
    }));
  }, []);

  return <Ctx.Provider value={{ ...state, recordOpen, recordClose }}>{children}</Ctx.Provider>;
}

export function useJournal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>');
  return ctx;
}
