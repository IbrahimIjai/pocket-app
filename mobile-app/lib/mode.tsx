import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { KEYS, loadJson, saveJson } from './persist';

export type Mode = 'demo' | 'live';

type ModeContext = { mode: Mode; setMode: (m: Mode) => void };

const Ctx = createContext<ModeContext | null>(null);

/** Demo = paper trading on live prices; Live = real AUSD on Perpl. Persisted across restarts. */
export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('demo');

  useEffect(() => {
    loadJson<Mode>(KEYS.mode).then((saved) => {
      if (saved === 'demo' || saved === 'live') setModeState(saved);
    });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    saveJson(KEYS.mode, m);
  };

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export function useMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMode must be used inside <ModeProvider>');
  return ctx;
}
