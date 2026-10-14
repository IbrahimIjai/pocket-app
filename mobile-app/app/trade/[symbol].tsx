import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Screen } from '@/components/screen';
import { Chip } from '@/components/chip';
import { HoldButton } from '@/components/hold-button';
import { Text } from '@/components/ui/text';
import { formatPct, formatPrice, formatUsd } from '@/lib/format';
import { useDemo } from '@/lib/demo';
import { useJournal } from '@/lib/journal';
import { useOptionalSession } from '@/lib/account/session';
import {
  openLiveTrade,
  requiredCollateralUsd,
  TradeError,
  type TradeStep,
} from '@/lib/perpl/trade';
import { haptic } from '@/lib/haptics';
import { useMarket } from '@/hooks/useMarkets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { BOLDNESS, RISK_PRESETS_USD, sizeTrade, type Multiplier, type Side } from '@/lib/risk';
import { useTheme } from '@/hooks/useTheme';

const MAX_CUSTOM_RISK = 1000;

const STEP_LABEL: Record<TradeStep, string> = {
  approving: 'Approving AUSD…',
  'opening-account': 'Opening your trading account…',
  depositing: 'Moving dollars to trading…',
  ordering: 'Placing your trade…',
  closing: 'Closing…',
  withdrawing: 'Moving dollars back to your Pocket…',
};

// S5 · Trade ticket: the heart of the app. Copy rule (POCKET.md §2): the auto-close price
// and the dollar loss always share one sentence, and "liquidation" only appears in Details.
export default function TradeTicketScreen() {
  const params = useLocalSearchParams<{ symbol: string; side?: Side }>();
  const side: Side = params.side === 'short' ? 'short' : 'long';
  const router = useRouter();
  const theme = useTheme();
  const { market, isLoading } = useMarket(params.symbol ?? 'BTC');
  const { mode, balances, canTrade, readyOnPerplUsd, signedIn, positions } = usePortfolio();
  const demo = useDemo();
  const journal = useJournal();
  const session = useOptionalSession();
  const [step, setStep] = useState<TradeStep | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const [risk, setRisk] = useState<number>(5);
  const [custom, setCustom] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [k, setK] = useState<Multiplier>(5);
  const [showDetails, setShowDetails] = useState(false);

  if (!market) {
    return (
      <Screen back title="Trade">
        {isLoading ? (
          <ActivityIndicator className="mt-10" color={theme.brand.mint} />
        ) : (
          <Text className="font-inter text-typography-500">Unknown market.</Text>
        )}
      </Screen>
    );
  }

  const riskUsd = isCustom ? Math.min(Number(custom) || 0, MAX_CUSTOM_RISK) : risk;
  // Fall back to the boldest allowed multiplier if this market caps leverage lower.
  const allowed = BOLDNESS.filter((b) => b.k <= market.maxLeverage);
  const kUsed: Multiplier = k <= market.maxLeverage ? k : (allowed.at(-1)?.k ?? 2);
  const t = sizeTrade({
    riskUsd: riskUsd >= 1 ? riskUsd : 0,
    k: kUsed,
    markPrice: market.price,
    side,
    mmr: market.mmr,
    takerFeeRate: market.takerFeeRate,
  });
  const liveNeeded = requiredCollateralUsd(riskUsd, kUsed, market);
  // Perpl's minimum for opening an account or topping up is $10 (verified 2026-10-14).
  const liveToMove = liveNeeded > readyOnPerplUsd ? Math.max(liveNeeded - readyOnPerplUsd, 10) : 0;
  const affordable =
    mode === 'demo' ? riskUsd + t.openFee <= balances.pocketUsd : liveToMove <= balances.pocketUsd;
  const needsGas = mode === 'live' && signedIn && balances.mon <= 0;
  // Perpl merges same-market orders into one position; keep one live trade per market so the
  // max-loss numbers stay exact (POCKET.md §2).
  const alreadyOpen = mode === 'live' && positions.some((p) => p.symbol === market.symbol);
  const valid = canTrade && riskUsd >= 1 && affordable && !needsGas && !alreadyOpen;
  const canSubmit = valid && step === null;
  const dirWord = side === 'long' ? 'falls' : 'rises';
  const movePct = side === 'long' ? -t.autoCloseMovePct : t.autoCloseMovePct;

  const onConfirm = async () => {
    haptic('confirm');
    if (mode === 'demo') {
      const position = demo.open({ market, side, riskUsd, k: kUsed });
      router.replace({ pathname: '/position/[id]', params: { id: position.id } });
      return;
    }
    if (!session?.walletClient || !session.address) return;
    setTradeError(null);
    try {
      const res = await openLiveTrade({
        wallet: session.walletClient,
        address: session.address,
        market,
        side,
        riskUsd,
        k: kUsed,
        onStep: (s) => {
          session.touch();
          setStep(s);
        },
      });
      const positionId = `live-${market.marketId}`;
      journal.recordOpen({
        positionId,
        symbol: market.symbol,
        side,
        k: kUsed,
        riskUsd,
        openedAt: res.at,
        openTx: res.hash,
        settleMs: res.settleMs,
      });
      haptic('success');
      router.replace({ pathname: '/position/[id]', params: { id: positionId } });
    } catch (e) {
      haptic('error');
      setTradeError(
        e instanceof TradeError ? e.message : 'The trade didn’t go through. Try again.'
      );
    } finally {
      setStep(null);
    }
  };

  return (
    <Screen
      back
      title={`${market.symbol} goes ${side === 'long' ? 'Up' : 'Down'}`}
      scroll
      footer={
        <View className="gap-2">
          {step && (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color={theme.brand.mint} />
              <Text className="font-inter-medium text-sm text-typography-900">
                {STEP_LABEL[step]}
              </Text>
            </View>
          )}
          {tradeError && (
            <Text
              accessibilityRole="alert"
              className="text-center font-inter text-sm text-pocket-coral">
              {tradeError}
            </Text>
          )}
          <HoldButton
            label={step ? 'Working…' : 'Hold to trade'}
            variant={side === 'long' ? 'up' : 'down'}
            disabled={!canSubmit}
            onComplete={onConfirm}
          />
        </View>
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
            selected={kUsed === b.k}
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
            {mode === 'live' && liveToMove > 0 && (
              <Text className="font-inter text-xs text-typography-500">
                Pocket moves {formatUsd(liveToMove)} to your Perpl trading account (Perpl&apos;s
                minimum is $10). Only {formatUsd(riskUsd)} is at risk; the rest stays free and comes
                back when you close.
              </Text>
            )}
          </>
        ) : (
          <Text className="font-inter text-base text-typography-500">
            {!signedIn && mode === 'live'
              ? 'Unlock your Pocket with Face ID on Home to trade live, or switch to Demo on the You tab.'
              : !canTrade
                ? 'Loading your account…'
                : needsGas
                  ? 'You need a little MON for network fees. Add some on the Add dollars screen.'
                  : riskUsd < 1
                    ? 'Enter at least $1 to see your trade.'
                    : mode === 'live'
                      ? `This needs ${formatUsd(liveToMove)} in your Pocket (Perpl’s $10 minimum): you have ${formatUsd(balances.pocketUsd)}.`
                      : `Not enough in your Pocket. You have ${formatUsd(balances.pocketUsd)}.`}
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
      {showDetails && riskUsd >= 1 && (
        <View className="gap-2 rounded-2xl border border-outline-200 p-4">
          <Row label="Leverage" value={`${kUsed}× (max ${market.maxLeverage}×)`} />
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
