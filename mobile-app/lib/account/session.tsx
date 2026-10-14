import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, View } from 'react-native';
import type { PocketWalletClient } from '../chain';
import { SessionLifecycle } from './lifecycle';
import { createPocket, describeAccountError, signIn as unlockPasskey } from './passkey';
import type { PocketWallet } from './wallet';

type State = {
  status: 'signedOut' | 'unlocking' | 'ready';
  address: `0x${string}` | null;
  credentialId: string | null;
  walletClient: PocketWalletClient | null;
  error: string | null;
};

type SessionContext = State & {
  create: (name?: string) => Promise<boolean>;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  touch: () => void;
};

const EMPTY: State = {
  status: 'signedOut',
  address: null,
  credentialId: null,
  walletClient: null,
  error: null,
};
const Context = createContext<SessionContext | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const mounted = useRef(true);
  const [lifecycle] = useState(
    () =>
      new SessionLifecycle<PocketWallet>(
        (wallet) => {
          setState({
            status: 'ready',
            address: wallet.address,
            credentialId: wallet.credentialId,
            walletClient: wallet.walletClient,
            error: null,
          });
        },
        () => {
          setState(EMPTY);
        }
      )
  );

  useEffect(() => {
    mounted.current = true;
    if (AppState.currentState === 'background') lifecycle.background();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') lifecycle.background();
      else if (next === 'active') lifecycle.foreground();
    });
    return () => {
      mounted.current = false;
      subscription.remove();
      lifecycle.end(false);
    };
  }, [lifecycle]);

  const promptInFlight = useRef(false);
  const unlock = useCallback(
    async (create: () => Promise<PocketWallet>) => {
      if (!mounted.current || promptInFlight.current) return false;
      promptInFlight.current = true;
      try {
        const promise = lifecycle.unlock(create);
        // unlock clears the preceding session synchronously before this state update.
        if (mounted.current) setState({ ...EMPTY, status: 'unlocking' });
        return await promise;
      } catch (error) {
        lifecycle.end(mounted.current);
        if (mounted.current) setState({ ...EMPTY, error: describeAccountError(error) });
        return false;
      } finally {
        promptInFlight.current = false;
      }
    },
    [lifecycle]
  );

  const create = useCallback((name?: string) => unlock(() => createPocket(name)), [unlock]);
  const signIn = useCallback(() => unlock(unlockPasskey), [unlock]);
  const signOut = useCallback(() => lifecycle.end(), [lifecycle]);
  const touch = useCallback(() => lifecycle.touch(), [lifecycle]);

  return (
    <Context.Provider value={{ ...state, create, signIn, signOut, touch }}>
      <View style={{ flex: 1 }} onTouchStart={touch}>
        {children}
      </View>
    </Context.Provider>
  );
}

export function useSession(): SessionContext {
  const value = useContext(Context);
  if (!value) throw new Error('useSession must be inside SessionProvider.');
  return value;
}

/** Allows the welcome/demo entry to render while the global provider is being integrated. */
export function useOptionalSession(): SessionContext | null {
  return useContext(Context);
}
