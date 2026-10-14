import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useQuery } from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Chip } from '@/components/chip';
import { CopyAddress } from '@/components/copy-address';
import { PocketButton } from '@/components/pocket-button';
import { UnlockCard } from '@/components/account/unlock-card';
import { Text } from '@/components/ui/text';
import { useOptionalSession } from '@/lib/account/session';
import {
  createDeposit,
  describeStatus,
  getDepositStatus,
  getOrigins,
  type Deposit,
} from '@/lib/aurora';
import { EXPLORER_TX } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/brand';

const STATUS_POLL_MS = 5_000;

// Add dollars from any chain via Aurora Intents: send USDC/USDT on an EVM chain to a one-time
// deposit address; it arrives as USDC on Monad in the user's own Pocket wallet.
export default function AddAnyChainScreen() {
  const theme = useTheme();
  const session = useOptionalSession();
  const address = session?.status === 'ready' ? session.address : null;
  const origins = useQuery({
    queryKey: ['aurora-origins'],
    queryFn: getOrigins,
    staleTime: 3_600_000,
  });
  const [origin, setOrigin] = useState('base-usdc');
  const [amount, setAmount] = useState('20');
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useQuery({
    queryKey: ['aurora-status', deposit?.depositAddress],
    enabled: Boolean(deposit),
    queryFn: () => getDepositStatus(deposit!.depositAddress),
    refetchInterval: (q) =>
      q.state.data && describeStatus(q.state.data.status).done ? false : STATUS_POLL_MS,
  });

  if (!address) {
    return (
      <Screen back title="From any chain" scroll>
        <UnlockCard />
      </Screen>
    );
  }

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      setDeposit(await createDeposit(address, origin, Number(amount)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (deposit) {
    const s = describeStatus(status.data?.status ?? '');
    return (
      <Screen back title="From any chain" scroll>
        <Text className="mt-2 text-center font-inter text-base text-typography-900">
          Send <Text className="font-inter-bold">{deposit.amountIn ?? amount}</Text>{' '}
          {deposit.originLabel} to:
        </Text>
        <View className="mt-4 items-center self-center rounded-3xl bg-pocket-paper p-4">
          <QRCode
            value={deposit.depositAddress}
            size={184}
            color={colors.ink}
            backgroundColor={colors.paper}
          />
        </View>
        <View className="mt-4">
          <CopyAddress address={deposit.depositAddress} />
        </View>
        <Text className="mt-3 text-center font-inter text-xs text-typography-500">
          One-time address for this deposit. Send only {deposit.originLabel}, from any wallet or
          exchange. You&apos;ll receive about {deposit.amountOut ?? '—'} USDC on Monad
          {deposit.timeEstimateSec
            ? ` in ~${Math.max(1, Math.round(deposit.timeEstimateSec / 60))} min`
            : ''}
          .
        </Text>

        <View className="mt-6 flex-row items-center gap-3 rounded-3xl border border-outline-200 bg-background-50 p-4">
          {s.done ? (
            <Feather
              name={s.failed ? 'alert-circle' : 'check-circle'}
              size={20}
              color={s.failed ? theme.brand.coral : theme.brand.mint}
            />
          ) : (
            <ActivityIndicator size="small" color={theme.brand.mint} />
          )}
          <Text className="flex-1 font-inter-medium text-sm text-typography-900">{s.label}</Text>
        </View>
        {status.data?.destinationTx && (
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(EXPLORER_TX(status.data!.destinationTx!))}
            className="mt-3 flex-row items-center gap-1 self-center">
            <Text className="font-inter-medium text-sm text-pocket-violet">
              View on MonadVision
            </Text>
            <Feather name="arrow-up-right" size={14} color={theme.brand.violet} />
          </Pressable>
        )}
        <Text className="mt-6 text-center font-inter text-xs text-typography-500">
          Powered by Aurora Intents. If anything goes wrong, funds are refunded to your Pocket
          address on the source chain.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      back
      title="From any chain"
      scroll
      footer={
        <View className="gap-2">
          {error && (
            <Text
              accessibilityRole="alert"
              className="text-center font-inter text-sm text-pocket-coral">
              {error}
            </Text>
          )}
          <PocketButton
            label={busy ? 'Getting address…' : 'Get deposit address'}
            disabled={busy || !(Number(amount) >= 1)}
            onPress={() => void start()}
          />
        </View>
      }>
      <Text className="mt-2 font-inter text-base leading-6 text-typography-500">
        Move dollars to your Pocket from another chain. They arrive as USDC on Monad in your own
        wallet, ready to convert to AUSD.
      </Text>

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Send from</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {origins.isLoading ? (
          <ActivityIndicator color={theme.brand.mint} />
        ) : (
          (origins.data ?? []).map((o) => (
            <View key={o.id} className="w-[48%]">
              <Chip label={o.label} selected={origin === o.id} onPress={() => setOrigin(o.id)} />
            </View>
          ))
        )}
      </View>
      {origins.isError && (
        <Text className="mt-2 font-inter text-sm text-pocket-coral">
          Couldn&apos;t load sources. Check your connection.
        </Text>
      )}

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Amount</Text>
      <View className="mt-3 h-14 flex-row items-center rounded-2xl border border-outline-200 bg-background-50 px-4">
        <Text className="font-inter-semibold text-xl text-typography-500">$</Text>
        <TextInput
          value={amount}
          onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          accessibilityLabel="Amount in dollars"
          className="ml-1 flex-1 font-inter-semibold text-xl text-typography-900"
        />
      </View>
    </Screen>
  );
}
