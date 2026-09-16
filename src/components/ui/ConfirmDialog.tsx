import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { create } from 'zustand';

import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Red confirm button for irreversible actions. */
  destructive?: boolean;
  icon?: IconName;
}

interface ConfirmState {
  request: (ConfirmOptions & { resolve: (value: boolean) => void }) | null;
  open: (options: ConfirmOptions) => Promise<boolean>;
  settle: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      get().request?.resolve(false);
      set({ request: { ...options, resolve } });
    }),
  settle: (value) => {
    get().request?.resolve(value);
    set({ request: null });
  },
}));

/** Ask the user to confirm. Resolves true on confirm, false on cancel or dismiss. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().open(options);
}

/** Centred confirmation dialog. Mounted once in the root layout. */
export function ConfirmDialogHost() {
  const request = useConfirmStore((state) => state.request);
  const settle = useConfirmStore((state) => state.settle);
  if (!request) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={() => settle(false)}>
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        style={styles.backdrop}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => settle(false)}
          accessibilityRole="button"
          accessibilityLabel={request.cancelLabel}
        />
        <Animated.View
          entering={ZoomIn.duration(200)}
          style={styles.card}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          {request.icon ? (
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: request.destructive ? colors.dangerTint : colors.surface },
              ]}
            >
              <Icon
                name={request.icon}
                size={rs(26)}
                color={request.destructive ? 'danger' : 'text'}
                outline
              />
            </View>
          ) : null}
          <Text variant="sectionTitle" color="text" align="center" accessibilityRole="header">
            {request.title}
          </Text>
          {request.message ? (
            <Text variant="body" color="textMuted" align="center" style={styles.message}>
              {request.message}
            </Text>
          ) : null}
          <View style={styles.buttons}>
            <Button
              title={request.cancelLabel}
              variant="secondary"
              size="md"
              onPress={() => settle(false)}
              style={styles.button}
            />
            <Button
              title={request.confirmLabel}
              variant={request.destructive ? 'danger' : 'primary'}
              size="md"
              haptic={request.destructive ? 'warning' : 'medium'}
              onPress={() => settle(true)}
              style={styles.button}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(spacing.xl),
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: rs(spacing.xl),
    alignItems: 'center',
    gap: rs(spacing.sm),
  },
  iconWrap: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(spacing.xs),
  },
  message: { marginBottom: rs(spacing.xs) },
  buttons: {
    flexDirection: 'row',
    gap: rs(spacing.sm),
    alignSelf: 'stretch',
    marginTop: rs(spacing.sm),
  },
  button: { flex: 1 },
});
