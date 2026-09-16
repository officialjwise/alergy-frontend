import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { IconChip } from './IconChip';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { sizes, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface ListRowProps {
  label: string;
  value?: string;
  description?: string;
  icon?: IconName;
  iconColor?: ColorToken;
  iconOutline?: boolean;
  /** Puts the icon in a light-gray chip (as in "How it works"). */
  iconChip?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

/** Row used inside cards and settings lists: icon, label, optional value and trailing control. */
export function ListRow({
  label,
  value,
  description,
  icon,
  iconColor = 'text',
  iconOutline = true,
  iconChip = false,
  leading,
  trailing,
  chevron = false,
  onPress,
  destructive = false,
  style,
  accessibilityLabel,
  testID,
}: ListRowProps) {
  const body = (
    <>
      {leading ??
        (icon ? (
          iconChip ? (
            <IconChip icon={icon} size={40} iconSize={20} color={iconColor} outline={iconOutline} />
          ) : (
            <View style={styles.icon}>
              <Icon
                name={icon}
                size={rs(sizes.icon)}
                color={destructive ? 'danger' : iconColor}
                outline={iconOutline}
              />
            </View>
          )
        ) : null)}
      <View style={styles.text}>
        <Text variant="body" color={destructive ? 'danger' : 'textBody'}>
          {label}
        </Text>
        {description ? (
          <Text variant="small" color="textMuted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color="textMuted" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {chevron ? <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" /> : null}
    </>
  );
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        pressedScale={0.99}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
        style={[styles.row, style]}
        testID={testID}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View
      style={[styles.row, style]}
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: rs(56),
    gap: rs(spacing.md),
    paddingVertical: spacing.xs,
  },
  icon: { width: rs(sizes.icon), alignItems: 'center' },
  text: { flex: 1 },
  description: { marginTop: 2 },
  value: { maxWidth: '45%' },
});
