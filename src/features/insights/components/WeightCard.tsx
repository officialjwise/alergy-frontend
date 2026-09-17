import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Icon, PressableScale, Text } from '@/components/ui';
import { DashboardCard } from '@/features/home/components/DashboardCard';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { WeightGoalProgress } from '@/types';
import { formatLongDate, fromDayKey } from '@/utils/date';

export interface WeightCardProps {
  weight: WeightGoalProgress | null;
  onLogWeight: () => void;
  onSetGoal: () => void;
  testID?: string;
}

/** "Current Weight" card: figure, Log weight pill, start-to-goal bar and the goal date. */
export function WeightCard({ weight, onLogWeight, onSetGoal, testID }: WeightCardProps) {
  const { t, i18n } = useTranslation();
  const hasGoal = weight?.goalLbs !== null && weight?.goalLbs !== undefined;
  return (
    <DashboardCard padding={spacing.lg} testID={testID}>
      <View style={styles.head}>
        <View style={styles.figure}>
          <Text variant="small" color="textMuted">
            {t('insights.currentWeight')}
          </Text>
          <Text variant="stat" color="text">
            {weight ? t('insights.lbs', { value: weight.currentLbs }) : t('insights.addWeight')}
          </Text>
        </View>
        <PressableScale
          onPress={onLogWeight}
          haptic="light"
          pressedScale={0.96}
          accessibilityRole="button"
          accessibilityLabel={t('insights.logWeight')}
          style={styles.logButton}
          testID="insights-log-weight"
        >
          <Text variant="label" color="onPrimary">
            {t('insights.logWeight')}
          </Text>
          <Icon name="arrowForward" size={rs(16)} color="onPrimary" />
        </PressableScale>
      </View>
      {weight && hasGoal ? (
        <>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(weight.percent * 100)}%` }]} />
          </View>
          <View style={styles.bounds}>
            <Text variant="small" color="textMuted">
              {t('insights.start')}{' '}
              <Text variant="small" color="text" style={styles.bold}>
                {t('insights.lbs', { value: weight.startLbs })}
              </Text>
            </Text>
            <Text variant="small" color="textMuted">
              {t('insights.goal')}{' '}
              <Text variant="small" color="text" style={styles.bold}>
                {t('insights.lbs', { value: weight.goalLbs })}
              </Text>
            </Text>
          </View>
          <Text variant="small" color="textMuted" style={styles.goalDate}>
            {weight.goalDate && weight.percent < 1
              ? t('insights.goalBy', {
                  date: formatLongDate(fromDayKey(weight.goalDate).toISOString(), i18n.language),
                })
              : t('insights.atGoal')}
          </Text>
        </>
      ) : (
        <PressableScale
          onPress={onSetGoal}
          haptic="light"
          accessibilityRole="button"
          accessibilityLabel={t('insights.setGoal')}
          style={styles.setGoal}
        >
          <Icon name="flag" size={rs(16)} color="textBody" outline />
          <Text variant="label" color="textBody">
            {t('insights.setGoal')}
          </Text>
          <Icon name="chevronRight" size={rs(16)} color="textMuted" />
        </PressableScale>
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  figure: { gap: 2, flex: 1 },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    minHeight: rs(36),
    paddingHorizontal: rs(spacing.md),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    marginTop: rs(spacing.md),
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.primary },
  bounds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: rs(spacing.xs) },
  bold: { fontFamily: 'Inter_600SemiBold' },
  goalDate: { marginTop: rs(spacing.sm) },
  setGoal: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: rs(spacing.md) },
});
