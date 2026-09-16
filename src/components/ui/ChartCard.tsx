import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { borders, colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ChartCardProps {
  title: string;
  /** Pill on the right of the title ("82% safe"). */
  badge?: { label: string; icon?: IconName; color?: ColorToken; tint?: ColorToken };
  /** Help icon on the right (opens an explainer). */
  onHelp?: () => void;
  helpLabel?: string;
  /** Big figure under the title ("395 cals" style). */
  figure?: { value: string; unit?: string };
  /** Faded "not ready" look with an explanation in place of the chart. */
  locked?: { message: string };
  /** Legend rows drawn under the chart. */
  legend?: { label: string; color: ColorToken }[];
  footer?: ReactNode;
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** White card with a title row, optional figure, chart body, legend and footer. */
export function ChartCard({
  title,
  badge,
  onHelp,
  helpLabel,
  figure,
  locked,
  legend,
  footer,
  children,
  onPress,
  style,
  testID,
}: ChartCardProps) {
  const body = (
    <>
      <View style={styles.titleRow}>
        <Text variant="cardTitle" color="text" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors[badge.tint ?? 'surfaceStrong'] }]}>
            {badge.icon ? (
              <Icon name={badge.icon} size={rs(14)} color={badge.color ?? 'textBody'} outline />
            ) : null}
            <Text variant="small" color={badge.color ?? 'textBody'}>
              {badge.label}
            </Text>
          </View>
        ) : null}
        {onHelp ? (
          <PressableScale
            onPress={onHelp}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={helpLabel ?? title}
            hitSlop={8}
            style={styles.help}
          >
            <Icon name="helpCircle" size={rs(22)} color="textMuted" outline />
          </PressableScale>
        ) : null}
      </View>
      {figure ? (
        <View style={styles.figureRow}>
          <Text variant="statLg" color="text">
            {figure.value}
          </Text>
          {figure.unit ? (
            <Text variant="label" color="textMuted">
              {figure.unit}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={locked ? styles.locked : null} accessibilityElementsHidden={!!locked}>
        {children}
      </View>
      {locked ? (
        <View style={styles.lockedMessage}>
          <Icon name="clock" size={rs(16)} color="textMuted" outline />
          <Text variant="small" color="textMuted" style={styles.lockedText}>
            {locked.message}
          </Text>
        </View>
      ) : null}
      {legend && legend.length ? (
        <View style={styles.legend}>
          {legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors[item.color] }]} />
              <Text variant="small" color="textMuted">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[styles.card, style]}
        testID={testID}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View style={[styles.card, style]} testID={testID}>
      {body}
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
    gap: rs(spacing.sm),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
  title: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
  },
  help: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  figureRow: { flexDirection: 'row', alignItems: 'baseline', gap: rs(6) },
  locked: { opacity: 0.35 },
  lockedMessage: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  lockedText: { flex: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.md), justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { marginTop: rs(spacing.xs) },
});
