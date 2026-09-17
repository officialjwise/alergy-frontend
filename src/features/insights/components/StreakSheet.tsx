import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Ring, Sheet, Text, type SheetRef } from '@/components/ui';
import { dayStatus, STATUS_COLOR } from '@/features/home/components/WeekStrip';
import { useDaySummaries } from '@/features/home/useHome';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import { addDays, dayKey, fromDayKey } from '@/utils/date';

export interface StreakSheetProps {
  profileId: string | null;
  current: number;
  longest: number;
}

const DAYS = 14;

/** Explains the safe scanning streak and shows the last 14 days as rings. */
export const StreakSheet = forwardRef<SheetRef, StreakSheetProps>(function StreakSheet(
  { profileId, current, longest },
  ref,
) {
  const { t } = useTranslation();
  const today = dayKey(new Date());
  const from = dayKey(addDays(fromDayKey(today), -(DAYS - 1)));
  const days = useDaySummaries(profileId, from, today);
  const rings = useMemo(
    () =>
      Array.from({ length: DAYS }, (_, index) => {
        const key = dayKey(addDays(fromDayKey(from), index));
        return { key, status: dayStatus(days.data?.find((day) => day.date === key)) };
      }),
    [days.data, from],
  );

  return (
    <Sheet ref={ref} title={t('insights.streakSheetTitle')} closeLabel={t('common.close')}>
      <Text variant="body" color="textMuted">
        {t('insights.streakSheetBody')}
      </Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="stat" color="text">
            {current}
          </Text>
          <Text variant="small" color="textMuted">
            {t('insights.streakCurrent')}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="stat" color="text">
            {longest}
          </Text>
          <Text variant="small" color="textMuted">
            {t('insights.streakLongest')}
          </Text>
        </View>
      </View>
      <Text variant="label" color="text" style={styles.label}>
        {t('insights.streakLast14')}
      </Text>
      <View style={styles.rings} accessible accessibilityLabel={t('insights.streakLast14')}>
        {rings.map(({ key, status }) => (
          <Ring
            key={key}
            size={rs(20)}
            thickness={3}
            progress={status === 'none' ? 0 : 1}
            color={STATUS_COLOR[status]}
            trackColor="ring"
            dashed={status === 'none'}
          />
        ))}
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: rs(spacing.xl), marginTop: rs(spacing.lg) },
  stat: { gap: 2 },
  label: { marginTop: rs(spacing.lg), marginBottom: rs(spacing.xs) },
  rings: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6), paddingBottom: rs(spacing.lg) },
});
