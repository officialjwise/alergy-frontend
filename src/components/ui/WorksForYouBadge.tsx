import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { colors, radii, shadows, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface WorksForYouBadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The floating "Works for you" badge from the welcome and camera screens:
 * a 40pt green circle with a white ring sitting on a white pill.
 */
export function WorksForYouBadge({ label, style }: WorksForYouBadgeProps) {
  const circle = rs(sizes.badgeCircle);
  const ring = sizes.badgeRing;
  return (
    <View
      style={[styles.wrap, style]}
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.ring,
          {
            width: circle + ring * 2,
            height: circle + ring * 2,
            borderRadius: (circle + ring * 2) / 2,
          },
        ]}
      >
        <View style={[styles.circle, { width: circle, height: circle, borderRadius: circle / 2 }]}>
          <Icon name="check" size={Math.round(circle * 0.55)} color="onPrimary" />
        </View>
      </View>
      <View style={[styles.pill, { marginTop: -ring - circle * 0.35 }]}>
        <Text variant="badge" color="text" style={{ marginTop: circle * 0.3 }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  ring: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.badge,
  },
  circle: { backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  pill: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: rs(spacing.lg),
    paddingBottom: rs(spacing.sm),
    paddingTop: rs(spacing.xs),
    ...shadows.badge,
  },
});
