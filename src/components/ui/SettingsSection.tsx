import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Switch, View, type StyleProp, type ViewStyle } from 'react-native';

import { Divider } from './Card';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { borders, colors, radii, sizes, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SettingsSectionProps {
  /** Muted group label above the card ("Account", "Safety profile"). */
  title?: string;
  /** Optional action on the right of the label ("How to add?"). */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** White bordered card that stacks SettingsRows with dividers between them. */
export function SettingsSection({
  title,
  actionLabel,
  onAction,
  children,
  style,
  testID,
}: SettingsSectionProps) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.section, style]} testID={testID}>
      {title ? (
        <View style={styles.labelRow}>
          <Text variant="sectionLabel" color="textMuted" accessibilityRole="header">
            {title}
          </Text>
          {actionLabel && onAction ? (
            <PressableScale
              onPress={onAction}
              haptic="light"
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              hitSlop={8}
              style={styles.action}
            >
              <Text variant="label" color="textBody">
                {actionLabel}
              </Text>
            </PressableScale>
          ) : null}
        </View>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <Divider inset={rs(ROW_PADDING_H + sizes.icon + spacing.md)} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export interface SettingsRowProps {
  label: string;
  icon?: IconName;
  iconColor?: ColorToken;
  /** Value shown on the right in muted text ("Last synced 4:10 PM", "English"). */
  value?: string;
  description?: string;
  chevron?: boolean;
  /** Renders a switch instead of a chevron. */
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/** One settings row: 24pt icon in a fixed slot, label, optional value, chevron or switch. */
export function SettingsRow({
  label,
  icon,
  iconColor = 'text',
  value,
  description,
  chevron = true,
  toggle,
  trailing,
  onPress,
  destructive = false,
  disabled = false,
  accessibilityLabel,
  testID,
}: SettingsRowProps) {
  const textColor: ColorToken = destructive ? 'danger' : 'textBody';
  const body = (
    <>
      {icon ? (
        <View style={styles.iconSlot}>
          <Icon
            name={icon}
            size={rs(sizes.icon)}
            color={destructive ? 'danger' : iconColor}
            outline
          />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="body" color={textColor} numberOfLines={2}>
          {label}
        </Text>
        {description ? (
          <Text variant="small" color="textMuted" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="captionSm" color="textMuted" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          disabled={disabled}
          trackColor={{ true: colors.primary, false: colors.track }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.track}
          accessibilityLabel={label}
        />
      ) : chevron && !trailing ? (
        <Icon name="chevronRight" size={rs(20)} color="textPlaceholder" />
      ) : null}
    </>
  );

  if (onPress && !toggle) {
    return (
      <PressableScale
        onPress={onPress}
        disabled={disabled}
        haptic="light"
        pressedScale={0.99}
        pressedOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
        accessibilityState={{ disabled }}
        style={[styles.row, disabled ? styles.disabled : null]}
        testID={testID}
      >
        {body}
      </PressableScale>
    );
  }
  return (
    <View style={[styles.row, disabled ? styles.disabled : null]} testID={testID}>
      {body}
    </View>
  );
}

const ROW_PADDING_H = spacing.md;

const styles = StyleSheet.create({
  section: { marginBottom: rs(spacing.xl) },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(spacing.xs),
  },
  action: { minHeight: 44, justifyContent: 'center' },
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: rs(60),
    paddingHorizontal: rs(ROW_PADDING_H),
    paddingVertical: rs(spacing.xs),
    gap: rs(spacing.md),
  },
  iconSlot: { width: rs(sizes.icon), alignItems: 'center' },
  text: { flex: 1 },
  description: { marginTop: 2 },
  value: { maxWidth: '45%' },
  disabled: { opacity: 0.5 },
});
