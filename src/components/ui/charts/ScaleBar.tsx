import { StyleSheet, View } from 'react-native';

import { Text } from '../Text';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ScaleSegment {
  label: string;
  color: ColorToken;
}

export interface ScaleBarProps {
  segments: ScaleSegment[];
  /** Index of the active segment; the marker sits in its middle unless `markerPosition` is given. */
  markerIndex: number;
  /** Exact marker position along the bar, 0..1 (BMI value on its scale). */
  markerPosition?: number;
  accessibilityLabel: string;
}

/** Four-colour scale with a marker and a legend underneath (caution level card). */
export function ScaleBar({
  segments,
  markerIndex,
  markerPosition,
  accessibilityLabel,
}: ScaleBarProps) {
  const count = Math.max(1, segments.length);
  const fraction =
    markerPosition === undefined
      ? (markerIndex + 0.5) / count
      : Math.min(1, Math.max(0, markerPosition));
  const markerLeft = `${fraction * 100}%` as const;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={styles.bar}>
        {segments.map((segment, index) => (
          <View
            key={segment.label}
            style={[
              styles.segment,
              { backgroundColor: colors[segment.color] },
              index === 0 ? styles.first : null,
              index === segments.length - 1 ? styles.last : null,
            ]}
          />
        ))}
        <View style={[styles.marker, { left: markerLeft }]} />
      </View>
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={segment.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors[segment.color] }]} />
            <Text
              variant="small"
              color={index === markerIndex ? 'text' : 'textMuted'}
              style={index === markerIndex ? styles.active : null}
              numberOfLines={2}
            >
              {segment.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: rs(12), gap: 2, position: 'relative' },
  segment: { flex: 1 },
  first: { borderTopLeftRadius: radii.pill, borderBottomLeftRadius: radii.pill },
  last: { borderTopRightRadius: radii.pill, borderBottomRightRadius: radii.pill },
  marker: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: rs(20),
    marginLeft: -1.5,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(spacing.sm),
    marginTop: rs(spacing.sm),
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: '40%', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  active: { fontFamily: 'Inter_600SemiBold' },
});
