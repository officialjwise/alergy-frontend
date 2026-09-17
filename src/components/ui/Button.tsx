import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { HapticKind } from '@/hooks/useHaptics';
import { colors, radii, sizes, spacing, borders } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export type ButtonVariant = 'primary' | 'secondary' | 'apple' | 'text' | 'danger';
export type ButtonSize = 'sm' | 'lg' | 'md' | 'auth';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Icon rendered before the label (Apple logo, Google mark, mail icon). */
  leading?: ReactNode;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const HEIGHTS: Record<ButtonSize, number> = {
  sm: 36,
  lg: sizes.button,
  md: 52,
  auth: sizes.authButton,
};

/**
 * Pill button from the PDF: 62pt tall, full width, near-black with white
 * 18pt SemiBold label. `secondary` is the white/bordered Google + email
 * style, `apple` the black Sign in with Apple, `text` the plain "No" link.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  leading,
  haptic = 'light',
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const isText = variant === 'text';
  const inactive = disabled || loading;
  const labelColor =
    variant === 'primary' || variant === 'apple' || variant === 'danger' ? 'onPrimary' : 'textBody';

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      pressedScale={isText ? 1 : 0.97}
      pressedOpacity={isText ? 0.6 : 0.92}
      style={[
        styles.base,
        isText ? styles.text : { height: rs(HEIGHTS[size]) },
        variantStyles[variant],
        disabled && !loading ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={labelColor === 'onPrimary' ? colors.onPrimary : colors.textBody}
        />
      ) : (
        <View style={styles.content}>
          {leading ? <View style={styles.leading}>{leading}</View> : null}
          <Text
            variant={isText ? 'textButton' : size === 'sm' ? 'badge' : 'button'}
            color={labelColor}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xl,
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  leading: { marginRight: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  text: { minHeight: sizes.touchTarget, paddingVertical: spacing.xs },
  disabled: { opacity: 0.35 },
});

const variantStyles = StyleSheet.create<Record<ButtonVariant, ViewStyle>>({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  apple: { backgroundColor: colors.appleBlack },
  text: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
});
