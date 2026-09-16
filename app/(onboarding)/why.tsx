import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, Card, Icon, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const WITHOUT = ['without1', 'without2', 'without3'] as const;
const WITH = ['with1', 'with2', 'with3'] as const;

/** "Why use this app?" - without (red X) vs with (green check) comparison cards. */
export default function WhyScreen() {
  const { t } = useTranslation();
  return (
    <OnboardingScreen
      route="why"
      header={false}
      footer={(nav) => (
        <Button title={t('common.letsGetStarted')} onPress={nav.goNext} haptic="medium" />
      )}
    >
      <Text variant="titleLg" color="text" style={styles.title} accessibilityRole="header">
        {t('why.title')}
      </Text>
      <Card title={t('why.without')} style={styles.card}>
        {WITHOUT.map((key) => (
          <View key={key} style={styles.row}>
            <Icon name="close" size={rs(26)} color="danger" />
            <Text variant="body" color="textBody" style={styles.rowText}>
              {t(`why.${key}`)}
            </Text>
          </View>
        ))}
      </Card>
      <Card title={t('why.with')} style={styles.card}>
        {WITH.map((key) => (
          <View key={key} style={styles.row}>
            <Icon name="check" size={rs(26)} color="successBright" />
            <Text variant="body" color="textBody" style={styles.rowText}>
              {t(`why.${key}`)}
            </Text>
          </View>
        ))}
      </Card>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(spacing.xl) },
  card: { marginTop: rv(spacing.lg) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    paddingVertical: rs(spacing.sm),
  },
  rowText: { flex: 1 },
});
