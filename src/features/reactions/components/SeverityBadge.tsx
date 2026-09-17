import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ReactionSeverity } from '@/types';

export const SEVERITY_THEME: Record<
  ReactionSeverity,
  { color: ColorToken; tint: ColorToken; icon: IconName }
> = {
  mild: { color: 'info', tint: 'infoTint', icon: 'info' },
  moderate: { color: 'warning', tint: 'warningTint', icon: 'warning' },
  severe: { color: 'danger', tint: 'dangerTint', icon: 'alert' },
};

/** Icon + label pill for a reaction's severity (never colour alone). */
export function SeverityBadge({ severity }: { severity: ReactionSeverity }) {
  const { t } = useTranslation();
  const theme = SEVERITY_THEME[severity];
  const label = t(`reactions.severity_${severity}`);
  return (
    <View
      style={[styles.badge, { backgroundColor: colors[theme.tint] }]}
      accessible
      accessibilityLabel={label}
    >
      <Icon name={theme.icon} size={rs(14)} color={theme.color} />
      <Text variant="small" color={theme.color}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: rs(spacing.xs),
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
});
