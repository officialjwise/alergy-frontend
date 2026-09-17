import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Icon, NavHeader, PressableScale, Screen, showToast, Text, type IconName } from '@/components/ui';
import { appConfig } from '@/config/app';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const BENEFITS: { key: 'b1' | 'b2' | 'b3'; icon: IconName }[] = [
  { key: 'b1', icon: 'people' },
  { key: 'b2', icon: 'scan' },
  { key: 'b3', icon: 'mealPlan' },
];

/** Family plan upgrade (approved placeholder): illustration, three benefits, price and the upgrade button. */
export default function FamilyPlanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const app = t('home.appName');
  return (
    <Screen
      header={<NavHeader />}
      footer={
        <View style={styles.footer}>
          <Text variant="small" color="textMuted" align="center">
            {appConfig.familyPlan.priceLine}
          </Text>
          <Button
            title={t('settingsScreens.familyPlan.cta')}
            onPress={() => showToast({ message: t('settingsScreens.familyPlan.notified'), icon: 'bell' })}
            haptic="medium"
            testID="family-plan-upgrade"
          />
          <View style={styles.links}>
            {(
              [
                { key: 'terms', doc: 'terms' },
                { key: 'privacy', doc: 'privacy' },
                { key: 'restore', doc: null },
              ] as const
            ).map((link, index) => (
              <View key={link.key} style={styles.linkRow}>
                {index > 0 ? (
                  <Text variant="small" color="textMuted">
                    ·
                  </Text>
                ) : null}
                <PressableScale
                  onPress={() =>
                    link.doc
                      ? router.push({ pathname: '/legal/[doc]', params: { doc: link.doc } })
                      : showToast({ message: t('settingsScreens.familyPlan.restored'), icon: 'refresh' })
                  }
                  haptic="light"
                  accessibilityRole="link"
                  accessibilityLabel={t(`settingsScreens.familyPlan.${link.key}`)}
                  hitSlop={8}
                >
                  <Text variant="small" color="textMuted">
                    {t(`settingsScreens.familyPlan.${link.key}`)}
                  </Text>
                </PressableScale>
              </View>
            ))}
          </View>
        </View>
      }
      testID="settings-family-plan"
    >
      <View style={styles.illustration} accessible accessibilityLabel={t('settingsScreens.familyPlan.artA11y')}>
        <View style={styles.circle}>
          <Icon name="people" size={rs(96)} color="text" />
          <View style={styles.heart}>
            <Icon name="heart" size={rs(26)} color="health" />
          </View>
        </View>
      </View>
      <Text variant="title" color="text" align="center" accessibilityRole="header">
        {t('settingsScreens.familyPlan.title', { app })}
      </Text>
      <View style={styles.list}>
        {BENEFITS.map((benefit) => (
          <View key={benefit.key} style={styles.row}>
            <Icon name={benefit.icon} size={rs(22)} color="text" outline />
            <Text variant="body" color="textBody" style={styles.rowText}>
              {t(`settingsScreens.familyPlan.${benefit.key}`, { count: appConfig.familyPlan.maxMembers })}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  illustration: { alignItems: 'center', marginTop: rs(spacing.lg), marginBottom: rs(spacing.xl) },
  circle: {
    width: rs(220),
    height: rs(220),
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: { position: 'absolute', right: rs(40), top: rs(46) },
  list: { gap: rs(spacing.md), marginTop: rs(spacing.xl), alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.md) },
  rowText: { flexShrink: 1 },
  footer: { gap: rs(spacing.sm) },
  links: { flexDirection: 'row', justifyContent: 'center', gap: rs(spacing.xs) },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs) },
});
