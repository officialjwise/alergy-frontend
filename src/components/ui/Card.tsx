import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { borders, colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface CardProps {
  children: ReactNode;
  title?: string;
  /** `tint` is the lavender card (review, profile, why-use); `outlined` the white bordered card (setup checklist). */
  variant?: 'tint' | 'outlined' | 'plain';
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Large 24pt-radius content card with an optional 22pt SemiBold title. */
export function Card({
  children,
  title,
  variant = 'tint',
  padding = spacing.xl,
  style,
  testID,
}: CardProps) {
  return (
    <View
      style={[styles.card, variantStyles[variant], { padding: rs(padding) }, style]}
      testID={testID}
    >
      {title ? (
        <Text variant="sectionTitle" color="text" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, { marginLeft: inset }, style]} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg },
  title: { marginBottom: rs(spacing.lg) },
  divider: { height: borders.hairline, backgroundColor: colors.divider, alignSelf: 'stretch' },
});

const variantStyles = StyleSheet.create<Record<NonNullable<CardProps['variant']>, ViewStyle>>({
  tint: { backgroundColor: colors.surfaceTint },
  outlined: {
    backgroundColor: colors.background,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  plain: { backgroundColor: colors.background },
});
