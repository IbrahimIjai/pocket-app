import { Image, Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/ui/text';
import { formatPct, formatPrice } from '@/lib/format';
import { tokenLogo } from '@/lib/token-logos';
import type { Market } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

export function AssetBadge({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const logo = tokenLogo(symbol);
  if (logo) {
    return (
      <Image
        source={logo}
        accessibilityLabel={symbol}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      className="items-center justify-center rounded-full bg-background-100"
      style={{ width: size, height: size }}>
      <Text className="font-inter-bold text-xs text-typography-900">{symbol}</Text>
    </View>
  );
}

export function MarketRow({ market, onPress }: { market: Market; onPress: () => void }) {
  const theme = useTheme();
  const up = market.change24hPct >= 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${market.name}, ${formatPrice(market.price)}, ${formatPct(market.change24hPct)} today`}
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 active:opacity-70">
      <AssetBadge symbol={market.symbol} />
      <View className="flex-1">
        <Text className="font-inter-semibold text-base text-typography-900">{market.symbol}</Text>
        <Text className="font-inter text-sm text-typography-500">{market.name}</Text>
      </View>
      <View className="items-end">
        <Text
          className="font-inter-semibold text-base text-typography-900"
          style={{ fontVariant: ['tabular-nums'] }}>
          {formatPrice(market.price)}
        </Text>
        <Text
          className={`font-inter-medium text-sm ${up ? 'text-pocket-mint' : 'text-pocket-coral'}`}
          style={{ fontVariant: ['tabular-nums'] }}>
          {formatPct(market.change24hPct)}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={theme.muted} />
    </Pressable>
  );
}
