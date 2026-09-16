import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { forwardRef, useCallback, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { colors, layout, radii, shadows, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SheetProps extends Omit<
  BottomSheetModalProps,
  'children' | 'backdropComponent' | 'handleComponent'
> {
  title?: string;
  closeLabel: string;
  children: ReactNode;
  onClose?: () => void;
}

export type SheetRef = BottomSheetModal;

export function useSheetRef() {
  return useRef<BottomSheetModal>(null);
}

/** Blurred + tinted backdrop, matching the language sheet in the PDF. */
function Backdrop({ animatedIndex, style }: BottomSheetBackdropProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View style={[style, animatedStyle]} pointerEvents="auto">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
    </Animated.View>
  );
}

function Handle() {
  return (
    <View style={styles.handleWrap}>
      <View style={styles.handle} />
    </View>
  );
}

/**
 * Bottom sheet with the PDF's 28pt radius, 44x5 grabber, 22pt SemiBold title
 * and 40pt close circle. Present with `ref.current?.present()`.
 */
export const Sheet = forwardRef<BottomSheetModal, SheetProps>(function Sheet(
  { title, closeLabel, children, onClose, onDismiss, ...rest },
  ref,
) {
  const insets = useSafeAreaInsets();
  const handleDismiss = useCallback(() => {
    onClose?.();
    onDismiss?.();
  }, [onClose, onDismiss]);
  const close = useCallback(() => {
    if (ref && typeof ref !== 'function') ref.current?.dismiss();
  }, [ref]);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={Backdrop}
      handleComponent={Handle}
      backgroundStyle={styles.background}
      style={styles.sheet}
      onDismiss={handleDismiss}
      {...rest}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
      >
        {title ? (
          <View style={styles.titleRow}>
            <Text
              variant="sectionTitle"
              color="text"
              style={styles.title}
              accessibilityRole="header"
            >
              {title}
            </Text>
            <PressableScale
              onPress={close}
              haptic="light"
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              hitSlop={8}
              style={styles.close}
            >
              <Icon name="close" size={rs(20)} color="textBody" />
            </PressableScale>
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

/** Backdrop press target when a custom backdrop needs to close the sheet. */
export function SheetBackdropPressable({ onPress }: { onPress: () => void }) {
  return <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityRole="button" />;
}

const close = rs(sizes.closeButton);

const styles = StyleSheet.create({
  sheet: { ...shadows.sheet },
  background: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  handleWrap: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs },
  handle: {
    width: sizes.sheetHandleWidth,
    height: sizes.sheetHandleHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.handle,
  },
  content: { paddingHorizontal: rs(layout.screenPaddingH) },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { flex: 1 },
  close: {
    width: close,
    height: close,
    borderRadius: close / 2,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
