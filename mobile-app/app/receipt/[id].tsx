import { Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Money } from '@/components/money';
import { PocketButton } from '@/components/pocket-button';
import { Text } from '@/components/ui/text';
import { formatUsd } from '@/lib/format';
import { useTheme } from '@/hooks/useTheme';

// S7 · Receipt. Phase 6 adds the "withdrawing…" state (Perpl withdraw allowance, plan §2.5).
export default function ReceiptScreen() {
  const params = useLocalSearchParams<{
    id: string;
    symbol?: string;
    pnl?: string;
    risk?: string;
    settleMs?: string;
    autoClosed?: string;
    demo?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();

  const pnl = Number(params.pnl ?? 0);
  const risk = Number(params.risk ?? 0);
  const settleS = (Number(params.settleMs ?? 0) / 1000).toFixed(1);
  const isDemo = params.demo === '1';
  const autoClosed = params.autoClosed === '1';
  const result =
    pnl >= 0
      ? `You risked ${formatUsd(risk, { cents: false })}, made ${formatUsd(pnl)}.`
      : `You risked ${formatUsd(risk, { cents: false })}, lost ${formatUsd(-pnl)}.`;

  const share = () =>
    Share.share({
      message: `Closed my ${params.symbol ?? ''} trade on Pocket: ${formatUsd(pnl, { sign: true })}. ${result} ${isDemo ? '(Demo trade.)' : `Settled on Monad in ${settleS}s.`}`,
    });

  return (
    <Screen
      footer={
        <View className="flex-row gap-3">
          <PocketButton className="flex-1" label="Done" onPress={() => router.replace('/home')} />
          <PocketButton
            className="flex-1"
            variant="secondary"
            label="Share"
            icon={<Feather name="share" size={18} color={theme.text} />}
            onPress={share}
          />
        </View>
      }>
      <View className="flex-1 items-center justify-center gap-3">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-pocket-mint">
          <Feather name="check" size={32} color={theme.brand.ink} />
        </View>
        <Text className="font-inter-semibold text-lg text-typography-900">
          {autoClosed ? 'Auto-closed' : 'Closed'}
        </Text>
        <Money value={pnl} sign tone className="font-inter-bold text-6xl leading-[68px]" />
        <Text className="text-center font-inter text-base text-typography-900">{result}</Text>
        <Text className="font-inter text-base text-typography-500">
          {autoClosed
            ? 'It hit your auto-close price — you lost only what you chose to risk.'
            : 'Back in your Pocket.'}
        </Text>
        {isDemo ? (
          <Text className="mt-2 font-inter-medium text-sm text-pocket-amber">
            Demo trade · live prices, no real money
          </Text>
        ) : (
          <View className="mt-2 flex-row items-center gap-1">
            <Feather name="zap" size={14} color={theme.brand.violet} />
            <Text className="font-inter-medium text-sm text-pocket-violet">
              Settled on Monad in {settleS}s
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}
