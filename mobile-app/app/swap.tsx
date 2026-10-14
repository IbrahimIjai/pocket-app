import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Linking, Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatUnits } from 'viem';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Chip } from '@/components/chip';
import { HoldButton } from '@/components/hold-button';
import { UnlockCard } from '@/components/account/unlock-card';
import { Text } from '@/components/ui/text';
import { useOptionalSession } from '@/lib/account/session';
import { EXPLORER_TX } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { executeSpot, quoteSpot, SPOT_TOKENS, type SpotQuote, type SpotToken } from '@/lib/kuru';
import { useLiveAccount } from '@/hooks/useLiveAccount';
import { useTheme } from '@/hooks/useTheme';

type Sym = SpotToken['symbol'];
const QUOTE_DEBOUNCE_MS = 700; // Kuru Flow allows ~1 request/second per user
const fmt = (v: bigint, t: SpotToken, digits = 4) =>
  Number(formatUnits(v, t.decimals)).toLocaleString('en-US', { maximumFractionDigits: digits });

// Spot "Buy" through Kuru on Monad: own the asset, no leverage. Also used for
// "convert USDC → AUSD" (Aurora deposits) and "get MON for fees".
export default function SwapScreen() {
  const params = useLocalSearchParams<{ from?: Sym; to?: Sym }>();
  const router = useRouter();
  const theme = useTheme();
  const session = useOptionalSession();
  const address = session?.status === 'ready' ? session.address : null;
  const live = useLiveAccount(address);

  const [from, setFrom] = useState<Sym>(params.from ?? 'AUSD');
  const [to, setTo] = useState<Sym>(params.to ?? 'MON');
  const [amount, setAmount] = useState('5');
  const [step, setStep] = useState<'approving' | 'swapping' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ hash: string; text: string } | null>(null);

  const balance =
    from === 'AUSD' ? live.data?.walletUsd : from === 'USDC' ? live.data?.usdcUsd : live.data?.mon;

  const debouncedAmount = useDebounced(amount, QUOTE_DEBOUNCE_MS);
  const quoteQuery = useQuery({
    queryKey: ['kuru-quote', address, from, to, debouncedAmount],
    enabled: Boolean(address) && from !== to && Number(debouncedAmount) > 0,
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: false,
    queryFn: () =>
      quoteSpot({
        user: address!,
        from: SPOT_TOKENS[from],
        to: SPOT_TOKENS[to],
        amount: debouncedAmount,
      }),
  });
  const quote: SpotQuote | null = from === to ? null : (quoteQuery.data ?? null);
  const quoting = quoteQuery.isFetching && !quoteQuery.data;
  const quoteError = quoteQuery.error instanceof Error ? quoteQuery.error.message : null;

  if (!address) {
    return (
      <Screen back title="Buy" scroll>
        <Text className="mt-2 font-inter text-base text-typography-500">
          Spot buying uses your real Pocket wallet on Monad.
        </Text>
        <UnlockCard />
      </Screen>
    );
  }

  const enough = balance === undefined || Number(amount) <= balance;
  const buy = async () => {
    if (!quote || !session?.walletClient) return;
    haptic('confirm');
    setError(null);
    try {
      const hash = await executeSpot(session.walletClient, quote, (s) => {
        session.touch();
        setStep(s);
      });
      haptic('success');
      setDone({
        hash,
        text: `Swapped ${fmt(quote.amountIn, quote.from)} ${quote.from.symbol} for about ${fmt(quote.out, quote.to)} ${quote.to.symbol}.`,
      });
      void live.refetch();
    } catch (e) {
      haptic('error');
      setError(e instanceof Error ? e.message : 'The swap didn’t go through.');
    } finally {
      setStep(null);
    }
  };

  if (done) {
    return (
      <Screen back title="Buy">
        <View className="flex-1 items-center justify-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-pocket-mint">
            <Feather name="check" size={32} color={theme.brand.ink} />
          </View>
          <Text className="text-center font-inter-semibold text-lg text-typography-900">
            {done.text}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(EXPLORER_TX(done.hash))}
            className="flex-row items-center gap-1">
            <Text className="font-inter-medium text-sm text-pocket-violet">
              View on MonadVision
            </Text>
            <Feather name="arrow-up-right" size={14} color={theme.brand.violet} />
          </Pressable>
          <Pressable onPress={() => router.back()} className="mt-4 py-2">
            <Text className="font-inter-semibold text-base text-pocket-mint">Done</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      back
      title="Buy"
      scroll
      footer={
        <View className="gap-2">
          {step && (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color={theme.brand.mint} />
              <Text className="font-inter-medium text-sm text-typography-900">
                {step === 'approving' ? `Approving ${from}…` : 'Swapping on Kuru…'}
              </Text>
            </View>
          )}
          {(error ?? quoteError) && (
            <Text
              accessibilityRole="alert"
              className="text-center font-inter text-sm text-pocket-coral">
              {error ?? quoteError}
            </Text>
          )}
          <HoldButton
            label={step ? 'Working…' : `Hold to buy ${to}`}
            disabled={!quote || !enough || step !== null}
            onComplete={() => void buy()}
          />
        </View>
      }>
      <Text className="mt-2 font-inter text-sm text-typography-500">
        Spot: you own what you buy. No leverage, no auto-close. Routed through Kuru&apos;s on-chain
        order books on Monad.
      </Text>

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Buy</Text>
      <View className="mt-3 flex-row gap-2">
        {(['MON', 'AUSD', 'USDC'] as Sym[]).map((s) => (
          <Chip
            key={s}
            label={s}
            selected={to === s}
            onPress={() => setTo(s)}
            disabled={s === from}
          />
        ))}
      </View>

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Pay with</Text>
      <View className="mt-3 flex-row gap-2">
        {(['AUSD', 'USDC', 'MON'] as Sym[]).map((s) => (
          <Chip
            key={s}
            label={s}
            selected={from === s}
            onPress={() => setFrom(s)}
            disabled={s === to}
          />
        ))}
      </View>

      <View className="mt-4 h-14 flex-row items-center rounded-2xl border border-outline-200 bg-background-50 px-4">
        <TextInput
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          accessibilityLabel={`Amount of ${from} to spend`}
          className="flex-1 font-inter-semibold text-xl text-typography-900"
        />
        <Text className="font-inter-semibold text-base text-typography-500">{from}</Text>
      </View>
      {balance !== undefined && (
        <Text
          className={`mt-2 font-inter text-xs ${enough ? 'text-typography-500' : 'text-pocket-coral'}`}>
          You have {balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {from}
          {from === 'MON' ? ' (keep a little for fees)' : ''}
        </Text>
      )}

      <View className="mt-6 gap-2 rounded-3xl border border-outline-200 bg-background-50 p-5">
        {quoting ? (
          <ActivityIndicator color={theme.brand.mint} />
        ) : quote ? (
          <>
            <Text className="font-inter text-lg leading-7 text-typography-900">
              You pay{' '}
              <Text className="font-inter-bold text-lg">
                {fmt(quote.amountIn, quote.from)} {from}
              </Text>{' '}
              and get about{' '}
              <Text className="font-inter-bold text-lg">
                {fmt(quote.out, quote.to)} {to}
              </Text>
              .
            </Text>
            <Text className="font-inter text-sm text-typography-500">
              At least {fmt(quote.minOut, quote.to)} {to} or the swap cancels (0.5% max slippage).
            </Text>
          </>
        ) : (
          <Text className="font-inter text-sm text-typography-500">
            {from === to ? 'Pick two different tokens.' : 'Enter an amount to see a quote.'}
          </Text>
        )}
      </View>
    </Screen>
  );
}

/** `value`, updated only after it has stopped changing for `ms`. */
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
