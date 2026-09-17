import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';

import {
  ChartCard,
  ErrorState,
  Icon,
  LargeTitleHeader,
  LineChart,
  PressableScale,
  ScaleBar,
  Screen,
  SegmentedControl,
  showToast,
  Skeleton,
  Sparkline,
  StackedBarChart,
  Text,
  useSheetRef,
  type IconName,
  type StackedBar,
} from '@/components/ui';
import { useActionPlan } from '@/features/actionPlan/useActionPlan';
import { BadgeEmblem } from '@/features/badges/components/BadgeEmblem';
import { FlameArt } from '@/features/badges/components/FlameArt';
import { DashboardCard } from '@/features/home/components/DashboardCard';
import { BmiSheet } from '@/features/insights/components/BmiSheet';
import { LogWeightSheet } from '@/features/insights/components/LogWeightSheet';
import { ProgressPhotosCard } from '@/features/insights/components/ProgressPhotosCard';
import { WeightCard } from '@/features/insights/components/WeightCard';
import { bmiScalePosition } from '@/features/tracking/nutrition';
import {
  useDailyCalories,
  useExpenditureChanges,
  useLogWeight,
  useTrackingOverview,
  useWeeklyEnergy,
  useWeightChanges,
  useWeightSeries,
} from '@/features/tracking/useTracking';
import { queryKeys } from '@/services/queryClient';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { BmiCategory, InsightsRange, WeightChangeRow } from '@/types';
import { formatShortDate, fromDayKey } from '@/utils/date';

const RANGES: { key: InsightsRange; labelKey: string }[] = [
  { key: '90d', labelKey: 'insights.range_90d' },
  { key: '6m', labelKey: 'insights.range_6m' },
  { key: '1y', labelKey: 'insights.range_1y' },
  { key: 'all', labelKey: 'insights.range_all' },
];
const WEEKS = [
  'insights.week_this',
  'insights.week_last',
  'insights.week_two',
  'insights.week_three',
] as const;
const TREND: Record<WeightChangeRow['trend'], { icon: IconName; color: ColorToken; rotate?: string }> = {
  up: { icon: 'arrowForward', color: 'success', rotate: '-45deg' },
  down: { icon: 'arrowForward', color: 'danger', rotate: '45deg' },
  same: { icon: 'arrowForward', color: 'textMuted' },
  pending: { icon: 'clock', color: 'textPlaceholder' },
};
const BMI_BANDS: { key: BmiCategory; color: ColorToken }[] = [
  { key: 'underweight', color: 'bmiUnder' },
  { key: 'healthy', color: 'bmiHealthy' },
  { key: 'overweight', color: 'bmiOver' },
  { key: 'obese', color: 'bmiObese' },
];
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * Insights: streak and badge tiles, current weight and goal, weight progress
 * and changes, progress photos, daily average calories, weekly energy,
 * expenditure changes and BMI.
 */
export default function InsightsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  const pid = profile?.id ?? null;
  const [range, setRange] = useState<InsightsRange>('90d');
  const [caloriesWeek, setCaloriesWeek] = useState('0');
  const [energyWeek, setEnergyWeek] = useState('0');
  const [refreshing, setRefreshing] = useState(false);
  const weightRef = useSheetRef();
  const bmiRef = useSheetRef();

  const overview = useTrackingOverview(pid);
  const series = useWeightSeries(pid, range);
  const changes = useWeightChanges(pid);
  const daily = useDailyCalories(pid, Number(caloriesWeek));
  const energy = useWeeklyEnergy(pid, Number(energyWeek));
  const expenditure = useExpenditureChanges(pid);
  const photos = useActionPlan(pid);
  const logWeight = useLogWeight();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(
        [
          queryKeys.insights.all,
          queryKeys.badges.all,
          queryKeys.weight.all,
          queryKeys.activity.all,
          queryKeys.actionPlan.all,
        ].map((key) => queryClient.invalidateQueries({ queryKey: key })),
      );
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const saveWeight = useCallback(
    async (weightLbs: number, photoUri?: string) => {
      if (!pid) return;
      try {
        await logWeight.mutateAsync({ profileId: pid, weightLbs, photoUri });
        weightRef.current?.dismiss();
        showToast({ message: t('weight.saved'), icon: 'scale' });
      } catch {
        showToast({ message: t('states.errorTitle'), icon: 'alert' });
      }
    },
    [logWeight, pid, t, weightRef],
  );

  const weekOptions = useMemo(
    () => WEEKS.map((key, index) => ({ key: String(index), label: t(key) })),
    [t],
  );
  const rangeOptions = useMemo(
    () => RANGES.map((item) => ({ key: item.key, label: t(item.labelKey) })),
    [t],
  );

  const weight = overview.data?.weight ?? null;
  const linePoints = useMemo(
    () =>
      (series.data ?? []).map((point) => ({
        value: point.weightLbs,
        label: formatShortDate(fromDayKey(point.date).toISOString(), i18n.language),
        tooltip: t('insights.weightTooltip', {
          date: formatShortDate(fromDayKey(point.date).toISOString(), i18n.language),
          weight: point.weightLbs,
        }),
      })),
    [i18n.language, series.data, t],
  );
  const lineAxis = useMemo(() => {
    const values = linePoints.map((point) => point.value);
    const centre = values.length ? (Math.min(...values) + Math.max(...values)) / 2 : (weight?.currentLbs ?? 120);
    const spread = values.length ? Math.max(4, (Math.max(...values) - Math.min(...values)) / 2 + 2) : 4;
    return { min: Math.round(centre - spread), max: Math.round(centre + spread), ticks: 5 };
  }, [linePoints, weight?.currentLbs]);

  const dailyBars = useMemo<StackedBar[]>(
    () =>
      (daily.data?.days ?? []).map((day, index) => ({
        label: t(`insights.weekday_${WEEKDAY_KEYS[index] ?? 'sun'}`),
        segments: [
          { value: Math.round(day.protein), color: 'protein' },
          { value: Math.round(day.carbs), color: 'carbs' },
          { value: Math.round(day.fat), color: 'fat' },
        ],
      })),
    [daily.data?.days, t],
  );
  const energyBars = useMemo<StackedBar[]>(
    () =>
      (energy.data?.days ?? []).map((day, index) => ({
        label: t(`insights.weekday_${WEEKDAY_KEYS[index] ?? 'sun'}`),
        segments: [
          { value: day.burned, color: 'carbs' },
          { value: day.consumed, color: 'success' },
        ],
      })),
    [energy.data?.days, t],
  );

  const bmi = overview.data?.bmi ?? null;
  const bmiIndex = bmi?.category ? BMI_BANDS.findIndex((band) => band.key === bmi.category) : 1;

  return (
    <Screen
      tabBar
      header={<LargeTitleHeader title={t('insights.title')} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.textMuted}
          />
        ),
      }}
      testID="insights-screen"
    >
      {overview.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void overview.refetch()}
          compact
        />
      ) : !overview.data ? (
        <View style={styles.stack}>
          <View style={styles.tiles}>
            <Skeleton height={rs(170)} radius={radii.lg} style={styles.flex} />
            <Skeleton height={rs(170)} radius={radii.lg} style={styles.flex} />
          </View>
          <Skeleton height={rs(150)} radius={radii.lg} />
        </View>
      ) : (
        <View style={styles.stack}>
          <View style={styles.tiles}>
            <DashboardCard
              onPress={() => router.push('/milestones')}
              accessibilityLabel={t('milestones.streakA11y', { count: overview.data.streak })}
              style={styles.tile}
              testID="insights-streak"
            >
              <FlameArt size={rs(88)} count={overview.data.streak} />
              <Text variant="body" color="textMuted">
                {t('insights.dayStreak')}
              </Text>
            </DashboardCard>
            <DashboardCard
              onPress={() => router.push('/milestones')}
              accessibilityLabel={t('milestones.badgesA11y', { count: overview.data.badgesEarned })}
              style={styles.tile}
              testID="insights-badges"
            >
              <BadgeEmblem size={rs(88)} color="badgeDark" label={String(overview.data.badgesEarned)} />
              <Text variant="body" color="textMuted">
                {t('insights.badgesEarned')}
              </Text>
            </DashboardCard>
          </View>

          <WeightCard
            weight={weight}
            onLogWeight={() => weightRef.current?.present()}
            onSetGoal={() => router.push('/settings/personal')}
            testID="insights-weight"
          />

          <ChartCard
            title={t('insights.weightProgress')}
            badge={{
              label: t('insights.ofGoal', { percent: Math.round((weight?.percent ?? 0) * 100) }),
              icon: 'flag',
            }}
            footer={
              <SegmentedControl
                options={rangeOptions}
                value={range}
                onChange={setRange}
                accessibilityLabel={t('insights.weightProgress')}
              />
            }
            testID="insights-weight-chart"
          >
            <LineChart
              points={linePoints}
              axis={lineAxis}
              area={false}
              color="text"
              height={200}
              accessibilityLabel={t('insights.weightChartA11y', { count: linePoints.length })}
              emptyLabel={t('insights.weightEmpty')}
            />
          </ChartCard>

          <ChartCard title={t('insights.weightChanges')} testID="insights-weight-changes">
            <View style={styles.rows}>
              {(changes.data ?? []).map((row) => {
                const trend = TREND[row.trend];
                return (
                  <View key={row.window} style={styles.changeRow}>
                    <Text variant="body" color={row.ready ? 'textBody' : 'textPlaceholder'} style={styles.windowLabel}>
                      {t(`insights.window_${row.window}`)}
                    </Text>
                    <Sparkline values={row.series} color="fat" muted={!row.ready} />
                    <Text variant="label" color={row.ready ? 'text' : 'textPlaceholder'} style={styles.changeValue}>
                      {row.ready && row.changeLbs !== null
                        ? t('insights.lbs', { value: row.changeLbs.toFixed(1) })
                        : t('insights.notReady')}
                    </Text>
                    <View style={styles.trend}>
                      <Icon
                        name={trend.icon}
                        size={rs(14)}
                        color={trend.color}
                        style={trend.rotate ? { transform: [{ rotate: trend.rotate }] } : undefined}
                      />
                      <Text variant="small" color={trend.color}>
                        {t(`insights.trend_${row.trend}`)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ChartCard>

          <ProgressPhotosCard
            photos={photos.data ?? []}
            onUpload={() => router.push('/progress-photos/privacy')}
            onOpen={() => router.push('/progress-photos')}
            testID="insights-photos"
          />

          <ChartCard
            title={t('insights.dailyCalories')}
            figure={{ value: String(daily.data?.average ?? 0), unit: t('insights.cals') }}
            footer={
              <View style={styles.footer}>
                <View style={styles.legend}>
                  {(
                    [
                      { key: 'protein', icon: 'drumstick', color: 'protein' },
                      { key: 'carbs', icon: 'grain', color: 'carbs' },
                      { key: 'fats', icon: 'drop', color: 'fat' },
                    ] as const
                  ).map((item) => (
                    <View key={item.key} style={styles.legendItem}>
                      <Icon name={item.icon} size={rs(13)} color={item.color} />
                      <Text variant="small" color="textBody">
                        {t(`insights.legend_${item.key}`)}
                      </Text>
                    </View>
                  ))}
                </View>
                <SegmentedControl
                  options={weekOptions}
                  value={caloriesWeek}
                  onChange={setCaloriesWeek}
                  variant="chips"
                  accessibilityLabel={t('insights.dailyCalories')}
                />
              </View>
            }
            testID="insights-daily-calories"
          >
            {daily.data?.hasData ? (
              <StackedBarChart
                bars={dailyBars}
                height={200}
                accessibilityLabel={t('insights.dailyChartA11y', { count: daily.data.average })}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>

          <ChartCard
            title={t('insights.weeklyEnergy')}
            legend={[
              { label: t('insights.burned'), color: 'carbs' },
              { label: t('insights.consumed'), color: 'success' },
            ]}
            footer={
              <SegmentedControl
                options={weekOptions}
                value={energyWeek}
                onChange={setEnergyWeek}
                variant="chips"
                accessibilityLabel={t('insights.weeklyEnergy')}
              />
            }
            testID="insights-weekly-energy"
          >
            <View style={styles.energyFigures}>
              {(
                [
                  { key: 'burned', value: energy.data?.burned ?? 0 },
                  { key: 'consumed', value: energy.data?.consumed ?? 0 },
                  { key: 'energy', value: (energy.data?.consumed ?? 0) - (energy.data?.burned ?? 0) },
                ] as const
              ).map((item) => (
                <View key={item.key}>
                  <Text variant="small" color="textMuted">
                    {t(`insights.${item.key}`)}
                  </Text>
                  <View style={styles.figureRow}>
                    <Text variant="stat" color="text" style={styles.energyValue}>
                      {item.key === 'energy' && item.value > 0 ? `+${item.value}` : item.value}
                    </Text>
                    <Text variant="small" color="textMuted">
                      {t('insights.cal')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            {energy.data && (energy.data.consumed > 0 || energy.data.burned > 0) ? (
              <StackedBarChart
                bars={energyBars}
                mode="grouped"
                height={200}
                accessibilityLabel={t('insights.energyChartA11y', {
                  burned: energy.data.burned,
                  consumed: energy.data.consumed,
                })}
              />
            ) : (
              <NoData />
            )}
          </ChartCard>

          <ChartCard title={t('insights.expenditure')} testID="insights-expenditure">
            <View style={styles.rows}>
              {(expenditure.data ?? []).map((row) => (
                <View key={row.window} style={styles.changeRow}>
                  <Text variant="body" color={row.ready ? 'textBody' : 'textPlaceholder'} style={styles.windowLabel}>
                    {t(`insights.window_${row.window}`)}
                  </Text>
                  <View style={[styles.miniBox, row.ready ? styles.miniBoxReady : null]} />
                  <Text variant="label" color={row.ready ? 'text' : 'textPlaceholder'} style={styles.changeValue}>
                    {row.ready && row.burned !== null
                      ? `${row.burned} ${t('insights.cal')}`
                      : t('insights.notReady')}
                  </Text>
                  <View style={styles.trend}>
                    <Icon name={row.ready ? 'arrowForward' : 'clock'} size={rs(14)} color={row.ready ? 'textMuted' : 'textPlaceholder'} outline />
                    <Text variant="small" color={row.ready ? 'textMuted' : 'textPlaceholder'}>
                      {t(`insights.trend_${row.trend}`)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ChartCard>

          <ChartCard
            title={t('insights.bmiTitle')}
            onHelp={() => bmiRef.current?.present()}
            helpLabel={t('insights.bmiHelp')}
            testID="insights-bmi"
          >
            {bmi?.value !== null && bmi?.value !== undefined && bmi.category ? (
              <>
                <View style={styles.bmiRow}>
                  <Text variant="statLg" color="text">
                    {bmi.value.toFixed(1)}
                  </Text>
                  <Text variant="body" color="textMuted">
                    {t('insights.bmiYourWeightIs')}
                  </Text>
                  <View style={[styles.bmiPill, { backgroundColor: colors.successTint }]}>
                    <Text variant="small" color="success">
                      {t(`insights.bmi_${bmi.category}`)}
                    </Text>
                  </View>
                </View>
                <ScaleBar
                  segments={BMI_BANDS.map((band) => ({
                    label: `${t(`insights.bmi_${band.key}`)} ${t(`insights.bmiRange_${band.key}`)}`,
                    color: band.color,
                  }))}
                  markerIndex={Math.max(0, bmiIndex)}
                  markerPosition={bmiScalePosition(bmi.value)}
                  accessibilityLabel={t('insights.bmiA11y', {
                    value: bmi.value.toFixed(1),
                    category: t(`insights.bmi_${bmi.category}`),
                  })}
                />
              </>
            ) : (
              <View style={styles.bmiEmpty}>
                <Text variant="body" color="textMuted">
                  {t('insights.bmiEmpty')}
                </Text>
                <PressableScale
                  onPress={() => router.push('/settings/personal')}
                  haptic="light"
                  accessibilityRole="button"
                  accessibilityLabel={t('insights.bmiAddDetails')}
                  style={styles.bmiLink}
                >
                  <Text variant="label" color="text">
                    {t('insights.bmiAddDetails')}
                  </Text>
                  <Icon name="chevronRight" size={rs(16)} color="textMuted" />
                </PressableScale>
              </View>
            )}
          </ChartCard>
        </View>
      )}

      <LogWeightSheet
        ref={weightRef}
        initialLbs={weight?.currentLbs ?? null}
        saving={logWeight.isPending}
        onSave={(value, photo) => void saveWeight(value, photo)}
      />
      <BmiSheet ref={bmiRef} />
    </Screen>
  );
}

function NoData() {
  const { t } = useTranslation();
  return (
    <View style={styles.noData}>
      <Icon name="image" size={rs(28)} color="textPlaceholder" outline />
      <Text variant="label" color="text">
        {t('insights.noData')}
      </Text>
      <Text variant="small" color="textMuted" align="center">
        {t('insights.noDataBody')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: rs(spacing.md) },
  tiles: { flexDirection: 'row', gap: rs(spacing.md) },
  tile: { flex: 1, alignItems: 'center', gap: rs(spacing.sm), paddingVertical: rs(spacing.xl) },
  flex: { flex: 1 },
  rows: { gap: rs(2) },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), minHeight: rs(42) },
  windowLabel: { width: rs(64) },
  changeValue: { flex: 1, textAlign: 'right' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4, width: rs(96), justifyContent: 'flex-end' },
  miniBox: { width: 40, height: 18, borderRadius: 4, backgroundColor: colors.warningTint },
  miniBoxReady: { backgroundColor: colors.infoTint },
  footer: { gap: rs(spacing.sm) },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: rs(spacing.md) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  energyFigures: { flexDirection: 'row', gap: rs(spacing.xl), marginBottom: rs(spacing.md) },
  figureRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  energyValue: { fontSize: rs(22), lineHeight: rs(28) },
  noData: { alignItems: 'center', gap: rs(6), paddingVertical: rs(spacing.xl) },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.xs), marginBottom: rs(spacing.md) },
  bmiPill: { paddingHorizontal: rs(spacing.xs), paddingVertical: 3, borderRadius: radii.pill },
  bmiEmpty: { gap: rs(spacing.sm) },
  bmiLink: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
});
