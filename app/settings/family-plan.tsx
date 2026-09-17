import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, IconChip, NavHeader, Screen, showToast, Text } from '@/components/ui';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const BENEFITS = ['b1', 'b2', 'b3', 'b4'] as const;

/** Family plan upgrade placeholder (approved by the brief): benefits and a notify-me action. */
export default function FamilyPlanScreen() {
  const { t } = useTranslation();
  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.familyPlan.title')} />}
      footer={
        <Button
          title={t('settingsScreens.familyPlan.cta')}
          onPress={() =>
            showToast({ message: t('settingsScreens.familyPlan.notified'), icon: 'bell' })
          }
          haptic="medium"
          testID="family-plan-notify"
        />
      }
      testID="settings-family-plan"
    >
      <View style={styles.hero}>
        <IconChip icon="crown" size={88} iconSize={40} background="warningTint" color="gold" />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {t('settingsScreens.familyPlan.title')}
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          {t('settingsScreens.familyPlan.subtitle')}
        </Text>
      </View>
      <View style={styles.list}>
        {BENEFITS.map((key) => (
          <View key={key} style={styles.row}>
            <Icon name="checkCircle" size={rs(22)} color="successBright" />
            <Text variant="body" color="textBody" style={styles.rowText}>
              {t(`settingsScreens.familyPlan.${key}`)}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="small" color="textMuted" align="center" style={styles.note}>
        {t('settingsScreens.familyPlan.placeholderNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: rs(spacing.sm), marginTop: rv(layout.titleTop) },
  list: { gap: rs(spacing.sm), marginTop: rv(spacing.xl) },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  rowText: { flex: 1 },
  note: { marginTop: rv(spacing.xl) },
});
