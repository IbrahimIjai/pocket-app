import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Chip } from '@/components/chip';
import { HoldButton } from '@/components/hold-button';
import { Text } from '@/components/ui/text';
import { formatPct, formatPrice, formatUsd } from '@/lib/format';
import { mockMarket } from '@/lib/mock';
import { BOLDNESS, RISK_PRESETS_USD, sizeTrade, type Multiplier, type Side } from '@/lib/risk';
import { useTheme } from '@/hooks/useTheme';

const MAX_CUSTOM_RISK = 1000;

// S5 · Trade ticket — the heart of the app. Copy rule (POCKET.md §2): the auto-close price
// and the dollar loss always share one sentence, and "liquidation" only appears in Details.
export default function TradeTicketScreen() {
  const params = useLocalSearchParams<{ symbol: string; side?: Side }>();
  const side: Side = params.side === 'short' ? 'short' : 'long';
  const router = useRouter();
  const theme = useTheme();
  const market = mockMarket(params.symbol ?? 'BTC');

  const [risk, setRisk] = useState<number>(5);
  const [custom, setCustom] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [k, setK] = useState<Multiplier>(5);
  const [showDetails, setShowDetails] = useState(false);

  if (!market) {
    return (
      <Screen back title="Trade">
        <Text className="font-inter text-typography-500">Unknown market.</Text>
      </Screen>
    );
  }

  const riskUsd = isCustom ? Math.min(Number(custom) || 0, MAX_CUSTOM_RISK) : risk;
  const valid = riskUsd >= 1;
  const t = sizeTrade({
    riskUsd: valid ? riskUsd : 0,
    k,
    markPrice: market.price,
    side,
    mmr: market.mmr,
    takerFeeRate: market.takerFeeRate,
  });
  const dirWord = side === 'long' ? 'falls' : 'rises';
  const movePct = side === 'long' ? -t.autoCloseMovePct : t.autoCloseMovePct;

  const onConfirm = () => {
    // Phase 6: passkey session → deposit → execOrder. For now jump to the mock live trade.
    router.replace({ pathname: '/position/[id]', params: { id: 'mock-btc-1' } });
  };

  return (
    <Screen
      back
      title={`${market.symbol} goes ${side === 'long' ? 'Up' : 'Down'}`}
      scroll
      footer={
        <HoldButton
          label="Hold to trade"
          variant={side === 'long' ? 'up' : 'down'}
          disabled={!valid}
          onComplete={onConfirm}
        />
      }>
      <Text className="mt-4 font-inter-semibold text-lg text-typography-900">
        How much are you willing to lose?
      </Text>
      <View className="mt-3 flex-row gap-2">
        {RISK_PRESETS_USD.map((v) => (
          <Chip
            key={v}
            label={`$${v}`}
            selected={!isCustom && risk === v}
            onPress={() => {
              setIsCustom(false);
              setRisk(v);
            }}
          />
        ))}
        <Chip label="Custom" selected={isCustom} onPress={() => setIsCustom(true)} />
      </View>
      {isCustom && (
        <View className="mt-3 h-14 flex-row items-center rounded-2xl border border-pocket-mint bg-background-50 px-4">
          <Text className="font-inter-semibold text-xl text-typography-500">$</Text>
          <TextInput
            autoFocus
            value={custom}
            onChangeText={(v) => setCustom(v.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.muted}
            accessibilityLabel="Custom amount at risk in dollars"
            className="ml-1 flex-1 font-inter-semibold text-xl text-typography-900"
          />
        </View>
      )}

      <Text className="mt-7 font-inter-semibold text-lg text-typography-900">How bold?</Text>
      <View className="mt-3 flex-row gap-2">
        {BOLDNESS.map((b) => (
          <Chip
            key={b.k}
            label={b.label}
            sublabel={`${b.k}×`}
            selected={k === b.k}
            disabled={b.k > market.maxLeverage}
            onPress={() => setK(b.k)}
          />
        ))}
      </View>

      <View className="mt-7 gap-3 rounded-3xl border border-outline-200 bg-background-50 p-5">
        {valid ? (
          <>
            <Text className="font-inter text-lg leading-7 text-typography-900">
              You&apos;re trading{' '}
              <Text className="font-inter-bold text-lg">{formatUsd(t.notional)}</Text> of{' '}
              {market.symbol}.
            </Text>
            <Text className="font-inter text-lg leading-7 text-typography-900">
              If {market.symbol} {dirWord} to about{' '}
              <Text className="font-inter-bold text-lg">{formatPrice(t.autoClosePrice)}</Text> (
              {formatPct(movePct)}), this trade closes and you lose{' '}
              <Text className="font-inter-bold text-lg text-pocket-coral">
                {formatUsd(t.maxLoss)}
              </Text>
              . That&apos;s the most you can lose.
            </Text>
            <Text className="font-inter text-sm text-typography-500">
              Fee to open: {formatUsd(t.openFee)}
            </Text>
          </>
        ) : (
          <Text className="font-inter text-base text-typography-500">
            Enter at least $1 to see your trade.
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showDetails }}
        onPress={() => setShowDetails((s) => !s)}
        className="mt-4 h-11 flex-row items-center gap-1">
        <Text className="font-inter-medium text-sm text-typography-500">Details</Text>
        <Feather name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color={theme.muted} />
      </Pressable>
      {showDetails && valid && (
        <View className="gap-2 rounded-2xl border border-outline-200 p-4">
          <Row label="Leverage" value={`${k}×`} />
          <Row label="Position size" value={`${t.size.toPrecision(4)} ${market.symbol}`} />
          <Row label="Entry (mark) price" value={formatPrice(market.price)} />
          <Row label="Margin" value={formatUsd(t.margin)} />
          <Row
            label="Maintenance margin"
            value={formatPct(market.mmr * 100, { sign: false, digits: 2 })}
          />
          <Row label="Liquidation price" value={formatPrice(t.autoClosePrice)} />
          <Row
            label="Taker fee"
            value={formatPct(market.takerFeeRate * 100, { sign: false, digits: 3 })}
          />
          <Row label="Perpl market id" value={String(market.marketId)} />
        </View>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="font-inter text-sm text-typography-500">{label}</Text>
      <Text
        className="font-inter-medium text-sm text-typography-900"
        style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}
