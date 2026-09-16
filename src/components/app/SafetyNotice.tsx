import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Required on every result screen: results are a guide, always check the label. */
export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <View style={styles.notice} accessibilityRole="text">
      <Icon name="info" size={rs(20)} color="textBody" outline />
      <Text variant={compact ? 'small' : 'body'} color="textBody" style={styles.text}>
        {compact ? t('safety.noticeShort') : t('safety.notice')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.sm),
    padding: rs(spacing.md),
    borderRadius: radii.card,
    backgroundColor: colors.surfaceTint,
  },
  text: { flex: 1 },
});
