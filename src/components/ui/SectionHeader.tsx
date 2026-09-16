import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

export interface SectionHeaderProps {
  title: string;
  /** Text action on the right ("See all", "+ Private group", "How to add?"). */
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: 'plus' | 'chevronRight';
  /** `title` is the bold in-page heading; `label` the muted settings group label. */
  variant?: 'title' | 'label';
  style?: StyleProp<ViewStyle>;
}

/** Row with a heading on the left and an optional action on the right. */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  actionIcon,
  variant = 'title',
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, variant === 'label' ? styles.labelRow : null, style]}>
      <Text
        variant={variant === 'title' ? 'sectionTitle' : 'sectionLabel'}
        color={variant === 'title' ? 'text' : 'textMuted'}
        style={styles.title}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <PressableScale
          onPress={onAction}
          haptic="light"
          pressedScale={0.96}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          style={styles.action}
        >
          {actionIcon === 'plus' ? <Icon name="plus" size={rs(18)} color="textBody" /> : null}
          <Text variant="label" color="textBody">
            {actionLabel}
          </Text>
          {actionIcon === 'chevronRight' ? (
            <Icon name="chevronRight" size={rs(16)} color="textMuted" />
          ) : null}
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(spacing.sm),
  },
  labelRow: { marginBottom: rs(spacing.xs) },
  title: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
});
