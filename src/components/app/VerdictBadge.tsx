import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { VERDICT_THEME } from '@/features/scan/verdictTheme';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { VerdictKind } from '@/types';

export interface VerdictBadgeProps {
  kind: VerdictKind;
  size?: 'sm' | 'md';
  name?: string;
}

/** Icon + label pill for a verdict. Used in history rows, home cards and the result header. */
export function VerdictBadge({ kind, size = 'sm', name }: VerdictBadgeProps) {
  const { t } = useTranslation();
  const theme = VERDICT_THEME[kind];
  const label =
    name && (kind === 'safe' || kind === 'unsafe')
      ? t(`${theme.titleKey}_other`, { name })
      : t(theme.titleKey);
  return (
    <View
      style={[
        styles.badge,
        size === 'md' ? styles.md : null,
        { backgroundColor: colors[theme.tint] },
      ]}
      accessible
      accessibilityLabel={label}
    >
      <Icon name={theme.icon} size={rs(size === 'md' ? 20 : 16)} color={theme.color} />
      <Text variant={size === 'md' ? 'label' : 'small'} color={theme.color} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    alignSelf: 'flex-start',
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
  },
  md: { paddingHorizontal: rs(spacing.md), paddingVertical: rs(spacing.xs) },
});
