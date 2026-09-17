import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, NavHeader, Screen, Skeleton, Text } from '@/components/ui';
import { useTrackingOverview } from '@/features/tracking/useTracking';
import { useReactions } from '@/features/reactions/useReactions';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { formatLongDate } from '@/utils/date';

/** Preview of the summary report for a doctor; shares the text until PDF export exists. */
export default function ExportReportScreen() {
  const { t, i18n } = useTranslation();
  const profile = useProfileStore(selectActiveProfile);
  const overview = useTrackingOverview(profile?.id ?? null);
  const reactions = useReactions(profile?.id ?? null);

  const restrictions =
    profile?.foods
      .map((item) => `${item.name} (${t(`q5.${item.kind}`)}, ${t(`risk.${item.level}`)})`)
      .join(', ') || t('settingsScreens.export.noRestrictions');
  const conditions =
    profile?.conditions.map((item) => t(`conditions.${item.id}`)).join(', ') ||
    t('settingsScreens.export.noRestrictions');
  const lines = [
    `${t('settingsScreens.export.title')} · ${formatLongDate(new Date().toISOString(), i18n.language)}`,
    `${t('settingsScreens.export.profile')}: ${profile?.name ?? ''} · ${t('settingsScreens.export.conditions')}: ${conditions}`,
    `${t('settingsScreens.export.restrictions')}: ${restrictions}`,
    `${t('settingsScreens.export.activity')} (${t('settingsScreens.export.period')}): ${t('settingsScreens.export.scans', { count: overview.data?.mealsLogged ?? 0 })}, ${t('settingsScreens.export.flagged', { count: overview.data?.flaggedMeals ?? 0 })}, ${t('settingsScreens.export.reactions', { count: reactions.data?.length ?? 0 })}`,
  ];

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.export.title')} />}
      footer={
        <Button
          title={t('settingsScreens.export.share')}
          leading={<Icon name="share" size={rs(20)} color="onPrimary" />}
          onPress={() => void Share.share({ message: lines.join('\n') })}
          haptic="medium"
          testID="export-share"
        />
      }
      testID="settings-export"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('settingsScreens.export.subtitle')}
      </Text>
      {overview.data ? (
        <Card variant="outlined" padding={spacing.lg} style={styles.card}>
          <Section label={t('settingsScreens.export.profile')} value={profile?.name ?? ''} />
          <Section label={t('settingsScreens.export.restrictions')} value={restrictions} />
          <Section label={t('settingsScreens.export.conditions')} value={conditions} />
          <Section
            label={`${t('settingsScreens.export.activity')} · ${t('settingsScreens.export.period')}`}
            value={[
              t('settingsScreens.export.scans', { count: overview.data.mealsLogged }),
              t('settingsScreens.export.flagged', { count: overview.data.flaggedMeals }),
              t('settingsScreens.export.reactions', { count: reactions.data?.length ?? 0 }),
            ].join('\n')}
          />
        </Card>
      ) : (
        <Skeleton height={rs(220)} radius={radii.lg} style={styles.card} />
      )}
      <Text variant="small" color="textMuted" style={styles.note}>
        {t('settingsScreens.export.note')}
      </Text>
    </Screen>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.section}>
      <Text variant="small" color="textMuted">
        {label}
      </Text>
      <Text variant="body" color="text">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rs(spacing.md) },
  card: { marginTop: rs(spacing.xl), gap: rs(spacing.md) },
  section: { gap: 2 },
  note: { marginTop: rs(spacing.md) },
});
