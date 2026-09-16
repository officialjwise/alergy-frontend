import { memo, useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { IconChip } from './IconChip';
import { PressableScale } from './PressableScale';
import { RadioCheck } from './RadioCheck';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { borders, colors, motion, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export type OptionCardDensity = 'regular' | 'compact';

export interface OptionCardProps {
  label: string;
  /** Optional second line (used by the severity screen and settings rows). */
  description?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  /** `checkbox` for multi select, `radio` for single select (announced by screen readers). */
  role?: 'radio' | 'checkbox';
  density?: OptionCardDensity;
  disabled?: boolean;
  /** Replaces the radio/check indicator. */
  trailing?: ReactNode;
  /** Replaces the icon chip (flags, avatars). */
  leading?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The selectable card used on every survey screen: icon chip, label,
 * 32pt indicator; 1pt light border when idle, 1.5pt near-black border when
 * selected. The selected border is an animated overlay so the layout never
 * shifts by half a point.
 */
function OptionCardComponent({
  label,
  description,
  icon,
  selected,
  onPress,
  role = 'radio',
  density = 'regular',
  disabled = false,
  trailing,
  leading,
  accessibilityLabel,
  style,
  testID,
}: OptionCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: motion.select });
  }, [progress, selected]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const compact = density === 'compact';
  const chipSize = compact ? sizes.iconChipCompact : sizes.iconChip;
  const iconSize = compact ? 22 : sizes.iconInChip;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      pressedScale={0.985}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? (description ? `${label}, ${description}` : label)}
      accessibilityState={{
        selected,
        checked: role === 'checkbox' ? selected : undefined,
        disabled,
      }}
      testID={testID}
      style={[
        styles.card,
        compact ? styles.compact : styles.regular,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.selectedBorder, overlayStyle]} />
      {leading ?? (icon ? <IconChip icon={icon} size={chipSize} iconSize={iconSize} /> : null)}
      <View style={styles.labels}>
        <Text variant="label" color="textBody">
          {label}
        </Text>
        {description ? (
          <Text variant="small" color="textMuted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ?? <RadioCheck selected={selected} />}
    </PressableScale>
  );
}

export const OptionCard = memo(OptionCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    paddingHorizontal: rs(spacing.lg),
    gap: rs(spacing.md),
  },
  regular: { minHeight: rs(sizes.optionCardMinHeight), paddingVertical: rs(spacing.lg) },
  compact: { minHeight: rs(sizes.optionCardCompactMinHeight), paddingVertical: rs(spacing.sm) },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.card,
    borderWidth: borders.selected,
    borderColor: colors.primary,
    margin: -borders.hairline,
  },
  labels: { flex: 1 },
  description: { marginTop: 2 },
  disabled: { opacity: 0.5 },
});
