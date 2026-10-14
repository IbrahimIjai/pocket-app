import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
  title?: string;
  /** Show a back chevron that pops the stack. */
  back?: boolean;
  right?: ReactNode;
  scroll?: boolean;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabBarSpace?: boolean;
  footer?: ReactNode;
  /** Pull-to-refresh (scroll screens only). */
  onRefresh?: () => Promise<unknown>;
};

export function Screen({
  children,
  title,
  back,
  right,
  scroll,
  tabBarSpace,
  footer,
  onRefresh,
}: Props) {
  const router = useRouter();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };
  const showHeader = Boolean(title || back || right);
  const bottom = tabBarSpace ? 112 : 24;

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top', 'left', 'right', 'bottom']}>
      {showHeader && (
        <View className="h-12 flex-row items-center gap-2 px-4">
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={() => router.back()}
              className="-ml-1 h-9 w-9 items-center justify-center rounded-full">
              <Feather name="chevron-left" size={24} color={theme.text} />
            </Pressable>
          )}
          {title && (
            <Text
              className="flex-1 font-inter-semibold text-lg text-typography-900"
              numberOfLines={1}>
              {title}
            </Text>
          )}
          {!title && <View className="flex-1" />}
          {right}
        </View>
      )}
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={theme.brand.mint}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5" style={{ paddingBottom: footer ? 0 : bottom }}>
          {children}
        </View>
      )}
      {footer && <View className="px-5 pb-2 pt-3">{footer}</View>}
    </SafeAreaView>
  );
}
