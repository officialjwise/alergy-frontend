import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, NavHeader, Ring, Screen, Text } from '@/components/ui';
import { STATUS_COLOR } from '@/features/home/components/WeekStrip';
import { colors, radii, shadows, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { RingStatus } from '@/types';

const SAMPLE: { day: string; date: number; status: RingStatus; today?: boolean }[] = [
  { day: 'Sun', date: 10, status: 'red' },
  { day: 'Mon', date: 11, status: 'none' },
  { day: 'Tue', date: 12, status: 'green' },
  { day: 'Wed', date: 13, status: 'green', today: true },
  { day: 'Thu', date: 14, status: 'none' },
  { day: 'Fri', date: 15, status: 'none' },
  { day: 'Sat', date: 16, status: 'none' },
];

const ROWS: RingStatus[] = ['green', 'yellow', 'red', 'none'];

/** What the ring colours on the home calendar mean, with a sample week above the rules. */
export default function RingColorsScreen() {
  const { t } = useTranslation();
  return (
    <Screen header={<NavHeader />} testID="ring-colors">
      <Text variant="largeTitle" color="text" style={styles.title} accessibilityRole="header">
        {t('ringColors.title')}
      </Text>
      <View style={styles.preview} accessible accessibilityLabel={t('ringColors.previewA11y')}>
        <View style={styles.previewHead}>
          <Text variant="cardTitle" color="text">
            {t('home.appName')}
          </Text>
          <View style={styles.streak}>
            <Icon name="flame" size={rs(14)} color="flame" />
            <Text variant="statSm" color="text">
              15
            </Text>
          </View>
        </View>
        <View style={styles.week}>
          {SAMPLE.map((day) => (
            <View key={day.day} style={[styles.dayTile, day.today ? styles.today : null]}>
              <Text variant="small" color={day.today ? 'text' : 'textMuted'}>
                {day.day}
              </Text>
              <Ring
                size={rs(30)}
                thickness={3}
                progress={day.status === 'none' ? 0 : 1}
                color={STATUS_COLOR[day.status]}
                trackColor="ring"
                dashed={day.status === 'none'}
              >
                <Text variant="small" color="text">
                  {day.date}
                </Text>
              </Ring>
            </View>
          ))}
        </View>
      </View>
      <Text variant="body" color="textBody" style={styles.intro}>
        {t('ringColors.intro')}
      </Text>
      <View style={styles.rows}>
        {ROWS.map((status) => (
          <View key={status} style={styles.row}>
            <Ring
              size={rs(30)}
              thickness={3}
              progress={status === 'none' ? 0 : 1}
              color={STATUS_COLOR[status]}
              trackColor="ring"
              dashed={status === 'none'}
            />
            <View style={styles.rowText}>
              <Text variant="label" color="text">
                {t(`ringColors.${status}Name`)}
              </Text>
              <Text variant="small" color="textMuted">
                {t(`ringColors.${status}Body`)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.sm), marginBottom: rs(spacing.lg) },
  preview: {
    padding: rs(spacing.md),
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    gap: rs(spacing.sm),
    ...shadows.card,
  },
  previewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: rs(spacing.xs),
    minHeight: rs(26),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayTile: { alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 4, borderRadius: radii.xs },
  today: { backgroundColor: colors.background, ...shadows.badge },
  intro: { marginTop: rs(spacing.xl) },
  rows: { marginTop: rs(spacing.lg), gap: rs(spacing.md) },
  row: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  rowText: { flex: 1, gap: 2 },
});
