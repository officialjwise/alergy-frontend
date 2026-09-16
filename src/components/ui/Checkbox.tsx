import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { borders, colors, motion, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Plain label, or a custom node (used for inline "Terms" / "Privacy Policy" links). */
  label?: string | ReactNode;
  accessibilityLabel?: string;
  disabled?: boolean;
  testID?: string;
}

/** 28pt square with 6pt radius; filled near-black with a white check when on. */
export function Checkbox({
  checked,
  onChange,
  label,
  accessibilityLabel,
  disabled,
  testID,
}: CheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: motion.select });
  }, [checked, progress]);

  const fillStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));
  const box = rs(sizes.checkbox);

  return (
    <PressableScale
      onPress={() => onChange(!checked)}
      disabled={disabled}
      haptic="selection"
      pressedScale={0.99}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      accessibilityState={{ checked, disabled }}
      style={styles.row}
      testID={testID}
    >
      <View style={[styles.box, { width: box, height: box }]}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Animated.View style={checkStyle}>
          <Icon name="check" size={Math.round(box * 0.6)} color="onPrimary" />
        </Animated.View>
      </View>
      {label ? (
        <View style={styles.label}>
          {typeof label === 'string' ? (
            <Text variant="body" color="textBody">
              {label}
            </Text>
          ) : (
            label
          )}
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.xl),
    minHeight: sizes.touchTarget,
  },
  box: {
    borderRadius: radii.xs,
    borderWidth: borders.selected,
    borderColor: colors.ring,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  label: { flex: 1, paddingTop: 2 },
});
