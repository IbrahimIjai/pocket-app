// Live trade journal (POCKET.md §3 S8), encrypted at rest with a passkey-sealed key
// (lib/journal-crypto.ts). While locked, new entries stay in memory and are sealed on unlock.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useOptionalSession } from './account/session';
import { describeAccountError } from './account/passkey';
import {
  createJournalKey,
  loadVault,
  openJournalKey,
  seal,
  unseal,
  type Sealed,
} from './journal-crypto';
import { KEYS, loadJson, removeKey, saveJson } from './persist';
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

type JournalData = { open: OpenEntry[]; trades: Trade[] };
export type JournalStatus = 'locked' | 'unlocking' | 'unlocked';

type JournalContext = JournalData & {
  status: JournalStatus;
  error: string | null;
  /** One passkey prompt: opens (or on first use, creates) the journal vault. */
  unlock: () => Promise<boolean>;
  recordOpen: (e: OpenEntry) => void;
  recordClose: (t: Trade) => void;
};

const EMPTY: JournalData = { open: [], trades: [] };
const MAX_TRADES = 200;
const Ctx = createContext<JournalContext | null>(null);

function merge(a: JournalData, b: JournalData): JournalData {
  const trades = [
    ...a.trades,
    ...b.trades.filter((t) => !a.trades.some((x) => x.id === t.id && x.closedAt === t.closedAt)),
  ]
    .sort((x, y) => y.closedAt - x.closedAt)
    .slice(0, MAX_TRADES);
  const open = [
    ...a.open,
    ...b.open.filter((e) => !a.open.some((x) => x.positionId === e.positionId)),
  ];
  return { open, trades };
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const session = useOptionalSession();
  const [data, setData] = useState<JournalData>(EMPTY);
  const [status, setStatus] = useState<JournalStatus>('locked');
  const [error, setError] = useState<string | null>(null);
  const key = useRef<Uint8Array | null>(null);

  // Seal on every change while unlocked; plaintext never touches disk.
  useEffect(() => {
    if (status === 'unlocked' && key.current) saveJson(KEYS.journalSealed, seal(key.current, data));
  }, [data, status]);

  // Lock (and wipe the key) when the passkey session ends.
  const sessionStatus = session?.status;
  useEffect(() => {
    if (sessionStatus === 'signedOut' && key.current) {
      key.current.fill(0);
      key.current = null;
      setData(EMPTY);
      setStatus('locked');
    }
  }, [sessionStatus]);

  const unlock = useCallback(async () => {
    const credentialId = session?.credentialId;
    if (!credentialId) {
      setError('Unlock your Pocket first.');
      return false;
    }
    setStatus('unlocking');
    setError(null);
    try {
      const vault = await loadVault();
      const journalKey = vault ? await openJournalKey(vault) : await createJournalKey(credentialId);
      const sealed = await loadJson<Sealed>(KEYS.journalSealed);
      const stored = sealed ? unseal<JournalData>(journalKey, sealed) : EMPTY;
      // One-time migration of the old plaintext journal, then delete it.
      const legacy = await loadJson<JournalData>(KEYS.journal);
      if (legacy) removeKey(KEYS.journal);
      key.current = journalKey;
      setData((inMemory) => merge(merge(inMemory, stored), legacy ?? EMPTY));
      setStatus('unlocked');
      return true;
    } catch (e) {
      setError(describeAccountError(e));
      setStatus('locked');
      return false;
    }
  }, [session?.credentialId]);

  const recordOpen = useCallback((e: OpenEntry) => {
    setData((s) => ({ ...s, open: [e, ...s.open.filter((x) => x.positionId !== e.positionId)] }));
  }, []);
  const recordClose = useCallback((t: Trade) => {
    setData((s) => ({
      open: s.open.filter((x) => x.positionId !== t.id),
      trades: [t, ...s.trades].slice(0, MAX_TRADES),
    }));
  }, []);

  return (
    <Ctx.Provider value={{ ...data, status, error, unlock, recordOpen, recordClose }}>
      {children}
    </Ctx.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>');
  return ctx;
}
