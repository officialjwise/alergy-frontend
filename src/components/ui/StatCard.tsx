import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Ring } from './Ring';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface StatCardProps {
  /** Big figure, rendered with tabular numerals so it never jumps. */
  value: string | number;
  label: string;
  /** Small text after the value ("/ 12", "%"). */
  unit?: string;
  caption?: string;
  /** Ring below the figures (small cards) or on the right (hero). */
  ring?: { progress: number; color: ColorToken; icon?: IconName; dashed?: boolean };
  /** Illustration or icon block above the figure (square cards). */
  art?: ReactNode;
  layout?: 'stack' | 'hero' | 'square';
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Stat card used on Home and Insights: one type style for numbers everywhere. */
export function StatCard({
  value,
  label,
  unit,
  caption,
  ring,
  art,
  layout = 'stack',
  onPress,
  accessibilityLabel,
  style,
  testID,
}: StatCardProps) {
  const figure = (
    <View style={styles.figureRow}>
      <Text variant={layout === 'hero' ? 'statLg' : 'stat'} color="text">
        {String(value)}
      </Text>
      {unit ? (
        <Text variant="label" color="textMuted" style={styles.unit}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
  const ringNode = ring ? (
    <Ring
      size={rs(layout === 'hero' ? 112 : 64)}
      thickness={layout === 'hero' ? 10 : 6}
      progress={ring.progress}
      color={ring.color}
      dashed={ring.dashed}
    >
      {ring.icon ? (
        <Icon name={ring.icon} size={rs(layout === 'hero' ? 30 : 22)} color={ring.color} />
      ) : null}
    </Ring>
  ) : null;

  const content =
    layout === 'hero' ? (
      <View style={styles.heroRow}>
        <View style={styles.heroText}>
          {figure}
          <Text variant="body" color="textMuted">
            {label}
          </Text>
          {caption ? (
            <Text variant="small" color="textMuted" style={styles.caption}>
              {caption}
            </Text>
          ) : null}
        </View>
        {ringNode}
      </View>
    ) : layout === 'square' ? (
      <View style={styles.square}>
        {art ? <View style={styles.art}>{art}</View> : null}
        {figure}
        <Text variant="body" color="textMuted" align="center">
          {label}
        </Text>
      </View>
    ) : (
      <View style={styles.stack}>
        {figure}
        <Text variant="small" color="textMuted" numberOfLines={2}>
          {label}
        </Text>
        {ringNode ? <View style={styles.stackRing}>{ringNode}</View> : null}
      </View>
    );

  const a11y = accessibilityLabel ?? `${label}: ${value}${unit ? ` ${unit}` : ''}`;
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        pressedScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={[styles.card, style]}
        testID={testID}
      >
        {content}
      </PressableScale>
    );
  }
  return (
    <View style={[styles.card, style]} accessible accessibilityLabel={a11y} testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    padding: rs(spacing.lg),
  },
  figureRow: { flexDirection: 'row', alignItems: 'baseline', gap: rs(4) },
  unit: { marginBottom: 2 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroText: { flex: 1, gap: rs(2) },
  caption: { marginTop: rs(4) },
  square: { alignItems: 'center', gap: rs(4) },
  art: { marginBottom: rs(spacing.xs) },
  stack: { gap: rs(2) },
  stackRing: { alignItems: 'center', marginTop: rs(spacing.sm) },
});
