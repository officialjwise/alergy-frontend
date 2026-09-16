import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from './Button';
import { IconChip } from './IconChip';
import { Text } from './Text';
import type { IconName } from './iconNames';
import { spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface StateViewProps {
  icon: IconName;
  iconColor?: ColorToken;
  iconBackground?: ColorToken;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Shared layout for empty and error states: 64pt icon circle, title, body, optional actions. */
export function StateView({
  icon,
  iconColor = 'text',
  iconBackground = 'surface',
  title,
  body,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
  style,
  testID,
}: StateViewProps) {
  return (
    <View style={[styles.wrap, compact ? styles.compact : null, style]} testID={testID}>
      <IconChip
        icon={icon}
        size={64}
        iconSize={28}
        color={iconColor}
        background={iconBackground}
        outline
      />
      <Text
        variant="sectionTitle"
        color="text"
        align="center"
        style={styles.title}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {body ? (
        <Text variant="body" color="textMuted" align="center" style={styles.body}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} size="md" style={styles.action} />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Button title={secondaryLabel} onPress={onSecondary} variant="text" />
      ) : null}
    </View>
  );
}

export function EmptyState(props: Omit<StateViewProps, 'iconColor' | 'iconBackground'>) {
  return <StateView {...props} />;
}

export function ErrorState(
  props: Omit<StateViewProps, 'icon' | 'iconColor' | 'iconBackground'> & { icon?: IconName },
) {
  return <StateView icon="alert" iconColor="danger" iconBackground="dangerTint" {...props} />;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: rs(spacing.huge),
    paddingHorizontal: rs(spacing.lg),
    gap: rs(spacing.sm),
  },
  compact: { paddingVertical: rs(spacing.xl) },
  title: { marginTop: rs(spacing.xs) },
  body: { maxWidth: 320 },
  action: { marginTop: rs(spacing.md), alignSelf: 'center', minWidth: 200 },
});
