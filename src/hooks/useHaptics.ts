import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticKind =
  'selection' | 'light' | 'medium' | 'success' | 'warning' | 'error' | 'none';

/** Fire-and-forget haptics. Never throws (haptics are unavailable on some Android devices and simulators). */
export function haptic(kind: HapticKind): void {
  if (kind === 'none' || Platform.OS === 'web') return;
  const run = (): Promise<void> => {
    switch (kind) {
      case 'selection':
        return Haptics.selectionAsync();
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      default:
        return Promise.resolve();
    }
  };
  run().catch(() => undefined);
}
