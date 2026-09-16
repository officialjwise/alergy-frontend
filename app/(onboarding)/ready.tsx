import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, Card, Icon, ListRow, Text, type IconName } from '@/components/ui';
import { summaryRows } from '@/features/onboarding/summary';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing, type ColorToken } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const ROW_ICONS: Record<
  'avoid' | 'protection' | 'diet' | 'goal',
  { icon: IconName; color: ColorToken; outline: boolean }
> = {
  avoid: { icon: 'ban', color: 'danger', outline: true },
  protection: { icon: 'shield', color: 'text', outline: false },
  diet: { icon: 'moon', color: 'successBright', outline: false },
  goal: { icon: 'target', color: 'text', outline: true },
};

const HOW_IT_WORKS: { key: 'step1' | 'step2' | 'step3' | 'step4'; icon: IconName }[] = [
  { key: 'step1', icon: 'camera' },
  { key: 'step2', icon: 'leaf' },
  { key: 'step3', icon: 'search' },
  { key: 'step4', icon: 'heart' },
];

/** "Your food profile is ready" - summary built from the real answers, plus "How it works". */
export default function ReadyScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const answers = useOnboardingStore((state) => state.answers);
  const rows = useMemo(() => summaryRows(answers, t), [answers, t]);
  const forOther =
    answers.profileFor && answers.profileFor !== 'myself' && answers.profileName.trim().length > 0;

  return (
    <OnboardingScreen
      route="ready"
      header={false}
      footer={(nav) => (
        <Button title={t('common.letsGetStarted')} onPress={nav.goNext} haptic="medium" />
      )}
    >
      <View style={[styles.check, { marginTop: Math.max(insets.top * 0.1, spacing.xs) }]}>
        <Icon name="check" size={rs(22)} color="onPrimary" />
      </View>
      <Text variant="titleLg" color="text" style={styles.title} accessibilityRole="header">
        {t('ready.title')}
      </Text>

      <Card
        title={
          forOther
            ? t('ready.profileFor', { name: answers.profileName.trim() })
            : t('ready.profile')
        }
        style={styles.card}
      >
        {rows.length === 0 ? (
          <Text variant="body" color="textMuted">
            {t('ready.nothingSelected')}
          </Text>
        ) : (
          rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon
                  name={ROW_ICONS[row.key].icon}
                  size={rs(24)}
                  color={ROW_ICONS[row.key].color}
                  outline={ROW_ICONS[row.key].outline}
                />
              </View>
              <Text variant="body" color="textBody" style={styles.rowText}>
                <Text variant="bodyStrong" color="text">
                  {t(row.labelKey)}{' '}
                </Text>
                {row.value}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card title={t('ready.howItWorks')} style={styles.card}>
        {HOW_IT_WORKS.map((item) => (
          <ListRow
            key={item.key}
            label={t(`ready.${item.key}`)}
            icon={item.icon}
            iconChip
            iconOutline={item.key !== 'step4'}
          />
        ))}
      </Card>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  check: {
    alignSelf: 'center',
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: rv(spacing.md) },
  card: { marginTop: rv(spacing.lg) },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(spacing.md),
    paddingVertical: rs(spacing.xs),
  },
  rowIcon: { width: rs(28), alignItems: 'center', paddingTop: 1 },
  rowText: { flex: 1 },
});
