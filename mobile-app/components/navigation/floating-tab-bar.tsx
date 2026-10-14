import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Text } from '@/components/ui/text';
import { colors, themes } from '@/theme/brand';
import { useColorScheme } from '@/hooks/useColorScheme';

const BAR_PADDING = 6;
const SPRING = { damping: 18, stiffness: 220, mass: 0.8 };

type FeatherName = keyof typeof Feather.glyphMap;

const ICONS: Record<string, FeatherName> = {
  home: 'home',
  activity: 'activity',
  you: 'user',
};

export function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth > 0 ? (barWidth - BAR_PADDING * 2) / state.routes.length : 0;

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, SPRING);
  }, [state.index, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 items-center"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        className="w-[88%] max-w-[380px] flex-row rounded-full border border-outline-200 bg-background-50"
        style={{
          padding: BAR_PADDING,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        }}>
        {tabWidth > 0 && (
          <Animated.View
            className="absolute rounded-full bg-pocket-mint"
            style={[
              { top: BAR_PADDING, bottom: BAR_PADDING, left: BAR_PADDING, width: tabWidth },
              indicatorStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TabButton
              key={route.key}
              label={label}
              icon={ICONS[route.name] ?? 'circle'}
              focused={focused}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  label,
  icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  icon: FeatherName;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const mode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const scale = useSharedValue(focused ? 1 : 0.92);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.92, SPRING);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1">
      <Animated.View
        className="flex-row items-center justify-center gap-2 py-3"
        style={animatedStyle}>
        <Feather name={icon} size={18} color={focused ? colors.ink : themes[mode].muted} />
        <Text
          className={`font-inter-medium text-sm ${focused ? 'text-pocket-ink' : 'text-typography-500'}`}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
