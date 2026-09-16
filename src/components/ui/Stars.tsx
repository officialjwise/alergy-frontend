import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { sizes } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface StarsProps {
  count?: number;
  size?: number;
  accessibilityLabel: string;
}

/** Row of gold stars from the review card. */
export function Stars({ count = 5, size = sizes.star, accessibilityLabel }: StarsProps) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {Array.from({ length: count }, (_, index) => (
        <Icon key={index} name="star" size={rs(size)} color="gold" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
