import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Chip } from '@/components/chip';
import { CopyAddress } from '@/components/copy-address';
import { Text } from '@/components/ui/text';
import { useOptionalSession } from '@/lib/account/session';
import { describeAccountError, revealRecoveryPhrase } from '@/lib/account/passkey';
import { BOLDNESS, RISK_PRESETS_USD, type Multiplier } from '@/lib/risk';
import { DEMO_START_USD, useDemo } from '@/lib/demo';
import { formatUsd } from '@/lib/format';
import { useMode, type Mode } from '@/lib/mode';
import { useTheme } from '@/hooks/useTheme';

// S9 · You / Settings. Phase 3 wires Sign out to the Mera session, Phase 4 the backup phrase.
export default function YouScreen() {
  const router = useRouter();
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const [defaultRisk, setDefaultRisk] = useState(5);
  const [defaultK, setDefaultK] = useState<Multiplier>(5);
  const { mode, setMode } = useMode();
  const session = useOptionalSession();
  const signedIn = session?.status === 'ready' && Boolean(session.address);
  const [phrase, setPhrase] = useState<string | null>(null);
  // Never leave the recovery phrase on screen after navigating away.
  useFocusEffect(useCallback(() => () => setPhrase(null), []));

  const backup = async () => {
    if (!session?.credentialId) {
      Alert.alert('Unlock first', 'Unlock your Pocket with Face ID to back it up.');
      return;
    }
    try {
      setPhrase(await revealRecoveryPhrase(session.credentialId));
    } catch (e) {
      Alert.alert('Couldn’t show your phrase', describeAccountError(e));
    }
  };
  const demo = useDemo();

  const chooseMode = (next: Mode) => {
    if (next === mode) return;
    if (next === 'live') {
      Alert.alert('Switch to Live?', 'Live trades use real AUSD on Monad.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go live', onPress: () => setMode('live') },
      ]);
    } else {
      setMode('demo');
    }
  };

  return (
    <Screen scroll tabBarSpace>
      <Text className="mt-4 font-inter-bold text-3xl text-typography-900">You</Text>

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Mode</Text>
      <View className="mt-3 flex-row gap-2">
        <Chip
          label="Demo"
          sublabel="Live prices, play money"
          selected={mode === 'demo'}
          onPress={() => chooseMode('demo')}
        />
        <Chip
          label="Live"
          sublabel="Real AUSD on Monad"
          selected={mode === 'live'}
          onPress={() => chooseMode('live')}
        />
      </View>
      {mode === 'demo' && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Reset demo?',
              `Closes all demo trades and resets your balance to ${formatUsd(DEMO_START_USD, { cents: false })}.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: demo.reset },
              ]
            )
          }
          className="mt-3 flex-row items-center gap-2 self-start py-2">
          <Feather name="rotate-ccw" size={14} color={theme.muted} />
          <Text className="font-inter-medium text-sm text-typography-500">
            Reset demo balance ({formatUsd(demo.balance)})
          </Text>
        </Pressable>
      )}

      <View className="mt-6 items-center gap-3 rounded-3xl border border-outline-200 bg-background-50 p-5">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-pocket-violet">
          <Feather name="user" size={24} color={theme.brand.paper} />
        </View>
        {signedIn && session?.address ? (
          <>
            <CopyAddress address={session.address} />
            <Text className="font-inter text-xs text-typography-500">
              Monad · secured by your passkey
            </Text>
          </>
        ) : (
          <Text className="font-inter text-sm text-typography-500">
            {mode === 'demo' ? 'Demo account: no wallet needed' : 'Not unlocked'}
          </Text>
        )}
      </View>

      <Text className="mt-8 font-inter-semibold text-lg text-typography-900">Default risk</Text>
      <View className="mt-3 flex-row gap-2">
        {RISK_PRESETS_USD.map((v) => (
          <Chip
            key={v}
            label={`$${v}`}
            selected={defaultRisk === v}
            onPress={() => setDefaultRisk(v)}
          />
        ))}
      </View>

      <Text className="mt-6 font-inter-semibold text-lg text-typography-900">Default boldness</Text>
      <View className="mt-3 flex-row gap-2">
        {BOLDNESS.map((b) => (
          <Chip
            key={b.k}
            label={b.label}
            sublabel={`${b.k}×`}
            selected={defaultK === b.k}
            onPress={() => setDefaultK(b.k)}
          />
        ))}
      </View>

      {phrase && (
        <View className="mt-8 gap-3 rounded-3xl border border-pocket-amber bg-background-50 p-5">
          <Text className="font-inter-semibold text-base text-typography-900">
            Your 24-word recovery phrase
          </Text>
          <Text className="font-inter text-xs text-pocket-amber">
            Anyone with these words controls your money. Write them down offline. Never share them.
          </Text>
          <Text
            selectable={false}
            className="font-inter-medium text-base leading-7 text-typography-900">
            {phrase
              .split(' ')
              .map((w, i) => `${i + 1}. ${w}`)
              .join('   ')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPhrase(null)}
            className="self-start py-2">
            <Text className="font-inter-semibold text-sm text-pocket-violet">Hide</Text>
          </Pressable>
        </View>
      )}

      <View className="mt-8 overflow-hidden rounded-3xl border border-outline-200 bg-background-50">
        <SettingsRow
          icon="key"
          label="Back up your account"
          hint="Shows your 24-word recovery phrase"
          onPress={() => void backup()}
        />
        <SettingsRow
          icon="log-out"
          label="Sign out"
          danger
          divider
          onPress={() => {
            setPhrase(null);
            session?.signOut();
            router.replace('/welcome');
          }}
        />
      </View>

      <Text className="mt-8 text-center font-inter text-xs text-typography-500">
        Pocket v{version} · Built on Monad with Mera, AUSD and Perpl
      </Text>
    </Screen>
  );
}

function SettingsRow({
  icon,
  label,
  hint,
  danger,
  divider,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  hint?: string;
  danger?: boolean;
  divider?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-4 active:opacity-70 ${divider ? 'border-t border-outline-200' : ''}`}>
      <Feather name={icon} size={18} color={danger ? theme.brand.coral : theme.text} />
      <View className="flex-1">
        <Text
          className={`font-inter-medium text-base ${danger ? 'text-pocket-coral' : 'text-typography-900'}`}>
          {label}
        </Text>
        {hint && <Text className="font-inter text-xs text-typography-500">{hint}</Text>}
      </View>
      {!danger && <Feather name="chevron-right" size={18} color={theme.muted} />}
    </Pressable>
  );
}
