import { ActivityIndicator, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/ui/text';
import { compactUsd, fetchSmartMoney, NotConfigured, summarize } from '@/lib/nansen';
import { useTheme } from '@/hooks/useTheme';

/** "What big wallets are doing": Nansen smart-money perp flows for this coin. */
export function SmartMoneyCard({ symbol }: { symbol: string }) {
  const theme = useTheme();
  const q = useQuery({
    queryKey: ['smart-money', symbol],
    queryFn: () => fetchSmartMoney(symbol),
    staleTime: 5 * 60_000,
    retry: (n, e) => !(e instanceof NotConfigured) && n < 1,
  });

  // Hide entirely until the server has a Nansen key, rather than showing a broken card.
  if (q.error instanceof NotConfigured) return null;

  const s = q.data;
  const total = s ? s.longOpenedUsd + s.shortOpenedUsd : 0;
  const longShare = total > 0 && s ? s.longOpenedUsd / total : 0.5;

  return (
    <View className="mt-6 gap-3 rounded-2xl border border-outline-200 bg-background-50 p-4">
      <View className="flex-row items-center gap-2">
        <Feather name="eye" size={16} color={theme.brand.violet} />
        <Text className="flex-1 font-inter-semibold text-sm text-typography-900">
          What big wallets are doing
        </Text>
        <Text className="font-inter text-xs text-typography-500">Nansen</Text>
      </View>
      {q.isLoading ? (
        <ActivityIndicator color={theme.brand.mint} />
      ) : q.isError || !s ? (
        <Text className="font-inter text-sm text-typography-500">
          Smart-money data is unavailable right now.
        </Text>
      ) : (
        <>
          <Text className="font-inter text-sm leading-5 text-typography-900">{summarize(s)}</Text>
          {total > 0 && (
            <View className="gap-1">
              <View className="h-2 flex-row overflow-hidden rounded-full">
                <View className="bg-pocket-mint" style={{ flex: longShare }} />
                <View className="bg-pocket-coral" style={{ flex: 1 - longShare }} />
              </View>
              <View className="flex-row justify-between">
                <Text className="font-inter text-xs text-pocket-mint">
                  Longs {compactUsd(s.longOpenedUsd)}
                </Text>
                <Text className="font-inter text-xs text-pocket-coral">
                  Shorts {compactUsd(s.shortOpenedUsd)}
                </Text>
              </View>
            </View>
          )}
          {s.top[0] && (
            <Text className="font-inter text-xs text-typography-500">
              Biggest: {s.top[0].label} · {s.top[0].action} {s.top[0].side}{' '}
              {compactUsd(s.top[0].valueUsd)}
            </Text>
          )}
          <Text className="font-inter text-xs text-typography-500">
            Context, not advice. Smart-money perp trades on Hyperliquid, last {s.lookbackHours}h.
          </Text>
        </>
      )}
    </View>
  );
}
