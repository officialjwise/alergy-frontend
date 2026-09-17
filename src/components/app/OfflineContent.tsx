import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { IconChip, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** No-internet illustration and copy, shared by the offline route and the route error boundary. */
export function OfflineContent() {
  const { t } = useTranslation();
  return (
    <View style={styles.hero}>
      <IconChip icon="wifiOff" size={88} iconSize={40} background="surfaceTint" outline />
      <Text variant="title" color="text" align="center" accessibilityRole="header">
        {t('offline.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" align="center">
        {t('offline.body')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: rs(spacing.md) },
});
