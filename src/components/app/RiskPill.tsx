import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { RiskLevel } from '@/types';

/** "High risk" or "Warning" pill: how a product containing a food is shown (questions 6 and 7). */
export function RiskPill({ level, size = 'sm' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const { t } = useTranslation();
  const high = level === 'high';
  return (
    <View
      style={[styles.pill, size === 'md' ? styles.md : null, { backgroundColor: high ? colors.dangerTint : colors.warningTint }]}
      accessible
      accessibilityLabel={t(`risk.${level}`)}
    >
      <Icon name={high ? 'closeCircle' : 'warning'} size={rs(size === 'md' ? 18 : 14)} color={high ? 'danger' : 'warning'} />
      <Text variant={size === 'md' ? 'label' : 'small'} color={high ? 'danger' : 'warning'}>
        {t(`risk.${level}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: rs(spacing.xs), paddingVertical: 3, borderRadius: radii.pill },
  md: { paddingHorizontal: rs(spacing.sm), paddingVertical: rs(6) },
});
