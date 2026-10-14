import { ActivityIndicator, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { CopyAddress } from '@/components/copy-address';
import { Text } from '@/components/ui/text';
import { UnlockCard } from '@/components/account/unlock-card';
import { useOptionalSession } from '@/lib/account/session';
import { useLiveAccount } from '@/hooks/useLiveAccount';
import { formatUsd } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/theme/brand';

const OPTIONS: { icon: keyof typeof Feather.glyphMap; label: string; soon?: boolean }[] = [
  { icon: 'send', label: 'From an exchange or wallet' },
  { icon: 'globe', label: 'From any chain', soon: true },
  { icon: 'credit-card', label: 'With a card', soon: true },
];

// S2 · Add dollars. Phase 4: real address, polls AUSD + MON every 2s, auto-advances when funded.
export default function AddDollarsScreen() {
  const theme = useTheme();
  const session = useOptionalSession();
  const address = session?.status === 'ready' ? session.address : null;
  const live = useLiveAccount(address);
  const ausd = live.data?.walletUsd ?? 0;
  const mon = live.data?.mon ?? 0;
  const funded = ausd > 0 && mon > 0;

  if (!address) {
    return (
      <Screen back title="Add dollars" scroll>
        <UnlockCard />
      </Screen>
    );
  }

  return (
    <Screen back title="Add dollars" scroll>
      <Text className="mt-2 text-center font-inter-medium text-sm text-typography-500">
        Your Pocket address
      </Text>
      {/* QR always sits on Paper so it scans in both themes. */}
      <View className="mt-3 items-center self-center rounded-3xl bg-pocket-paper p-4">
        <QRCode value={address} size={184} color={colors.ink} backgroundColor={colors.paper} />
      </View>
      <View className="mt-4">
        <CopyAddress address={address} />
      </View>

      <Text className="mt-8 font-inter-semibold text-lg text-typography-900">
        Send AUSD on Monad
      </Text>
      <View className="mt-3 overflow-hidden rounded-3xl border border-outline-200 bg-background-50">
        {OPTIONS.map((o, i) => (
          <View
            key={o.label}
            className={`flex-row items-center gap-3 px-4 py-4 ${i > 0 ? 'border-t border-outline-200' : ''} ${o.soon ? 'opacity-50' : ''}`}>
            <Feather name={o.icon} size={18} color={theme.text} />
            <Text className="flex-1 font-inter-medium text-base text-typography-900">
              {o.label}
            </Text>
            {o.soon && (
              <Text className="rounded-full bg-background-100 px-2 py-0.5 font-inter-medium text-xs text-typography-500">
                soon
              </Text>
            )}
          </View>
        ))}
      </View>

      <View className="mt-6 gap-3 rounded-3xl border border-outline-200 p-4">
        <BalanceRow label="AUSD (dollars)" value={formatUsd(ausd)} />
        <BalanceRow label="MON (for network fees)" value={`${mon.toFixed(4)} MON`} />
        <Text className="font-inter text-xs text-typography-500">
          You need a little MON too — every trade pays a tiny Monad network fee.
        </Text>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-2">
        {funded ? (
          <Feather name="check-circle" size={16} color={theme.brand.mint} />
        ) : (
          <ActivityIndicator size="small" color={theme.brand.mint} />
        )}
        <Text className="font-inter text-sm text-typography-500">
          {funded
            ? 'You’re funded — go pick a market.'
            : ausd > 0
              ? 'Dollars arrived. Now add a little MON for fees…'
              : 'Waiting for funds…'}
        </Text>
      </View>
    </Screen>
  );
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="font-inter text-base text-typography-500">{label}</Text>
      <Text
        className="font-inter-semibold text-base text-typography-900"
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
