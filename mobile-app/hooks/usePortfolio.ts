import { useDemo } from '@/lib/demo';
import { useMode } from '@/lib/mode';
import { useOptionalSession } from '@/lib/account/session';
import { useJournal } from '@/lib/journal';
import type { Balances, Position, Trade } from '@/lib/types';
import { useLiveAccount } from '@/hooks/useLiveAccount';
import { useIndexedTrades } from '@/hooks/useIndexedTrades';

const NONE: never[] = [];

export type Portfolio = {
  mode: 'demo' | 'live';
  balances: Balances;
  /** Live only: AUSD sitting free in the Perpl account (not at risk). */
  readyOnPerplUsd: number;
  positions: Position[];
  trades: Trade[];
  /** Live: history comes (partly) from the Envio indexer. */
  indexed: boolean;
  /** Live: signed in and account data loaded. Demo: always. */
  canTrade: boolean;
  signedIn: boolean;
  address: `0x${string}` | null;
  loading: boolean;
};

/** One source for balances, positions and history, whichever mode is on. */
export function usePortfolio(): Portfolio {
  const { mode } = useMode();
  const demo = useDemo();
  const session = useOptionalSession();
  const journal = useJournal();
  const address = session?.status === 'ready' ? session.address : null;
  const live = useLiveAccount(mode === 'live' ? address : null);
  const indexedTrades = useIndexedTrades(mode === 'live' ? address : null);

  if (mode === 'demo') {
    return {
      mode,
      balances: {
        pocketUsd: demo.balance,
        inTradesUsd: demo.positions.reduce((s, p) => s + p.riskUsd, 0),
        mon: 0,
      },
      readyOnPerplUsd: 0,
      positions: demo.positions,
      trades: demo.trades,
      indexed: false,
      canTrade: true,
      signedIn: Boolean(address),
      address,
      loading: false,
    };
  }

  const d = live.data;
  const positions = (d?.positions ?? NONE).map((p) => {
    const e = journal.open.find((x) => x.positionId === p.id);
    return e ? { ...p, k: e.k, openedAt: e.openedAt, openTx: e.openTx } : p;
  });
  return {
    mode,
    balances: {
      pocketUsd: d?.walletUsd ?? 0,
      inTradesUsd: positions.reduce((s, p) => s + p.riskUsd, 0),
      mon: d?.mon ?? 0,
    },
    readyOnPerplUsd: d?.freeUsd ?? 0,
    positions,
    // Indexer history is the source of truth across devices; the journal adds local-only
    // details (and covers the gap before the indexer catches up). Dedupe by close tx.
    trades: mergeTrades(journal.trades, indexedTrades.data ?? NONE),
    indexed: Boolean(indexedTrades.data?.length),
    canTrade: Boolean(address && d),
    signedIn: Boolean(address),
    address,
    loading: Boolean(address) && live.isLoading,
  };
}

function mergeTrades(local: Trade[], indexed: Trade[]): Trade[] {
  const seen = new Set(local.map((t) => t.closeTx).filter(Boolean));
  return [...local, ...indexed.filter((t) => !t.closeTx || !seen.has(t.closeTx))].sort(
    (a, b) => b.closedAt - a.closedAt
  );
}
