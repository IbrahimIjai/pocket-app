import { useColorScheme } from '@/hooks/useColorScheme';
import { colors, themes } from '@/theme/brand';

/** JS colour values for things className can't reach (icons, SVG, reanimated). */
export function useTheme() {
  const mode = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { mode, ...themes[mode], brand: colors } as const;
}
