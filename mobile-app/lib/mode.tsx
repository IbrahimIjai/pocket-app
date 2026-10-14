import { createContext, useContext, useState, type ReactNode } from 'react';

export type Mode = 'demo' | 'live';

type ModeContext = { mode: Mode; setMode: (m: Mode) => void };

const Ctx = createContext<ModeContext | null>(null);

/** Demo = paper trading on live prices; Live = real AUSD on Perpl (Phase 6). */
export function ModeProvider({ children }: { children: ReactNode }) {
  // TODO(persist): store in expo-secure-store once agent-b installs it (plan step D.1).
  const [mode, setMode] = useState<Mode>('demo');
  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export function useMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMode must be used inside <ModeProvider>');
  return ctx;
}
