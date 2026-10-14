import * as Haptics from 'expo-haptics';

type Kind = 'confirm' | 'success' | 'error' | 'tap';

/** Fire-and-forget haptic feedback; silently ignored where unsupported. */
export function haptic(kind: Kind) {
  const run =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : kind === 'error'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : kind === 'confirm'
          ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          : Haptics.selectionAsync();
  run.catch(() => {});
}
