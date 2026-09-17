import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, radii, shadows } from '@/theme/tokens';

export interface FlameArtProps {
  size: number;
  /** Streak count drawn in the white pill at the base of the flame. */
  count: number;
  accessibilityLabel?: string;
}

/** Orange flame with two sparkles and the streak count, the Day Streak artwork. */
export function FlameArt({ size, count, accessibilityLabel }: FlameArtProps) {
  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name="flame" size={size} color="flame" />
      <View style={[styles.sparkle, { top: size * 0.05, left: size * 0.05 }]}>
        <Icon name="starFour" size={size * 0.16} color="gold" />
      </View>
      <View style={[styles.sparkle, { top: size * 0.12, right: size * 0.02 }]}>
        <Icon name="starFour" size={size * 0.12} color="gold" />
      </View>
      <View
        style={[
          styles.pill,
          {
            bottom: size * 0.04,
            minWidth: size * 0.34,
            height: size * 0.3,
            paddingHorizontal: size * 0.08,
          },
        ]}
      >
        <Text
          variant="stat"
          color="text"
          style={{ fontSize: size * 0.2, lineHeight: size * 0.26 }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  sparkle: { position: 'absolute' },
  pill: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.badge,
  },
});
