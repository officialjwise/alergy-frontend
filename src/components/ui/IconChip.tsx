import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import type { IconName } from './iconNames';
import { colors, sizes, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface IconChipProps {
  icon: IconName;
  size?: number;
  iconSize?: number;
  color?: ColorToken;
  background?: ColorToken;
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The light-gray circle behind icons in option cards and feature rows. */
export function IconChip({
  icon,
  size = sizes.iconChip,
  iconSize = sizes.iconInChip,
  color = 'text',
  background = 'surface',
  outline = false,
  style,
}: IconChipProps) {
  const dimension = rs(size);
  return (
    <View
      style={[
        styles.chip,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: colors[background],
        },
        style,
      ]}
    >
      <Icon name={icon} size={rs(iconSize)} color={color} outline={outline} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { alignItems: 'center', justifyContent: 'center' },
});
