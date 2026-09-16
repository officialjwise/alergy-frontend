import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { haptic } from '@/hooks/useHaptics';
import { colors, layout, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ToastOptions {
  message: string;
  icon?: IconName;
  /** Inline action such as Undo. The toast stays a little longer when present. */
  action?: { label: string; onPress: () => void };
  durationMs?: number;
}

interface ToastState {
  current: (ToastOptions & { id: number }) | null;
  show: (options: ToastOptions) => void;
  hide: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  show: (options) => set({ current: { ...options, id: nextId++ } }),
  hide: () => set({ current: null }),
}));

/** Show a toast from anywhere (screens, hooks, services). */
export function showToast(options: ToastOptions) {
  useToastStore.getState().show(options);
}

export function useToast() {
  return useToastStore((state) => state.show);
}

/**
 * Renders the active toast above the tab bar. Mounted once in the root layout.
 * One toast at a time; a new one replaces the previous.
 */
export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current) return;
    haptic('success');
    const timeout = setTimeout(hide, current.durationMs ?? (current.action ? 5000 : 3000));
    return () => clearTimeout(timeout);
  }, [current, hide]);

  if (!current) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.host,
        { bottom: insets.bottom + rs(layout.tabBarBottom) + rs(layout.tabBarHeight) + rs(12) },
      ]}
    >
      <Animated.View
        key={current.id}
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(180)}
        style={styles.toast}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {current.icon ? <Icon name={current.icon} size={rs(18)} color="textOnDark" /> : null}
        <Text variant="label" color="textOnDark" style={styles.message} numberOfLines={2}>
          {current.message}
        </Text>
        {current.action ? (
          <PressableScale
            onPress={() => {
              current.action?.onPress();
              hide();
            }}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={current.action.label}
            hitSlop={8}
            style={styles.action}
          >
            <Text variant="label" color="successBright">
              {current.action.label}
            </Text>
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: rs(layout.screenPaddingH),
    right: rs(layout.screenPaddingH),
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.sm),
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    paddingHorizontal: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
    minHeight: rs(52),
    maxWidth: 520,
    alignSelf: 'stretch',
    ...shadows.sheet,
  },
  message: { flex: 1 },
  action: { paddingLeft: rs(spacing.xs), minHeight: 32, justifyContent: 'center' },
});
