import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon, Text, type IconName } from '@/components/ui';
import { ICONS } from '@/components/ui/iconNames';
import { colors, type ColorToken } from '@/theme/tokens';
import type { Badge, BadgeGroup } from '@/types';

export const GROUP_COLOR: Record<BadgeGroup, ColorToken> = {
  streak: 'flame',
  meals: 'success',
  goals: 'info',
  friends: 'fiber',
  water: 'water',
  habits: 'gold',
  food: 'successBright',
  special: 'badgeDark',
};

export function badgeIcon(badge: Pick<Badge, 'icon'>): IconName {
  return badge.icon in ICONS ? (badge.icon as IconName) : 'medal';
}

export interface BadgeEmblemProps {
  size: number;
  color: ColorToken;
  icon?: IconName;
  /** Big figure in the middle (the "Badges earned" tile). */
  label?: string;
  locked?: boolean;
  accessibilityLabel?: string;
}

/** Pointy-top hexagon emblem; grey with a white glyph while locked. */
export function BadgeEmblem({
  size,
  color,
  icon,
  label,
  locked = false,
  accessibilityLabel,
}: BadgeEmblemProps) {
  const fill = locked ? colors.badgeLocked : colors[color];
  const r = size / 2;
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return `${r + (r - 1) * Math.cos(angle)},${r + (r - 1) * Math.sin(angle)}`;
  });
  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={size} height={size}>
        <Path d={`M${points.join('L')}Z`} fill={fill} />
        <Path
          d={`M${points.join('L')}Z`}
          fill="none"
          stroke={locked ? colors.ring : colors.gold}
          strokeWidth={locked ? 1 : 2.5}
        />
      </Svg>
      <View style={styles.center}>
        {label ? (
          <Text
            variant={size >= 64 ? 'stat' : 'statSm'}
            color="onPrimary"
            style={{ fontSize: size * 0.36, lineHeight: size * 0.42 }}
          >
            {label}
          </Text>
        ) : icon ? (
          <Icon name={icon} size={size * 0.42} color="onPrimary" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
