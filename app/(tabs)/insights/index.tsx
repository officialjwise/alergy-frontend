import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  ChartCard,
  Divider,
  ErrorState,
  Icon,
  IconChip,
  LargeTitleHeader,
  LineChart,
  ListRow,
  PressableScale,
  ScaleBar,
  Screen,
  SegmentedControl,
  showToast,
  Skeleton,
  Sparkline,
  StackedBarChart,
  StatCard,
  Text,
  useSheetRef,
  type IconName,
  type StackedBar,
} from '@/components/ui';
import {
  pickDocumentPhoto,
  useActionPlan,
  useAddActionPlanPhoto,
} from '@/features/actionPlan/useActionPlan';
import { useBadges } from '@/features/badges/useBadges';
import { StreakSheet } from '@/features/insights/components/StreakSheet';
import {
  useDailyScans,
  useFlaggedSeries,
  useInsightsOverview,
  useScanChanges,
  useTopFlagged,
  useWeeklyOverview,
} from '@/features/insights/useInsights';
import { queryKeys } from '@/services/queryClient';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { CautionLevel, InsightsRange, ScanChangeRow } from '@/types';
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
const CAUTION_LEVELS: { key: CautionLevel; color: ColorToken }[] = [
  { key: 'ingredient', color: 'info' },
  { key: 'may_contain', color: 'success' },
  { key: 'cross_contact', color: 'warning' },
  { key: 'uncertain', color: 'danger' },
];
const TREND_ICON: Record<ScanChangeRow['trend'], { icon: IconName; color: ColorToken }> = {
  fewer: { icon: 'arrowForward', color: 'success' },
  same: { icon: 'arrowForward', color: 'textMuted' },
  more: { icon: 'arrowForward', color: 'danger' },
  pending: { icon: 'clock', color: 'textPlaceholder' },
};

/** Insights tab: streak and badges, reactions, flagged trend, changes, action plan, daily and weekly charts, top flagged, caution level. */
export default function InsightsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  const pid = profile?.id ?? null;
  const [range, setRange] = useState<InsightsRange>('90d');
  const [dailyWeek, setDailyWeek] = useState('0');
  const [weeklyWeek, setWeeklyWeek] = useState('0');
  const [refreshing, setRefreshing] = useState(false);
  const streakRef = useSheetRef();

  const overview = useInsightsOverview(pid);
  const badges = useBadges(pid);
  const series = useFlaggedSeries(pid, range);
  const changes = useScanChanges(pid);
  const daily = useDailyScans(pid, Number(dailyWeek));
  const weekly = useWeeklyOverview(pid, Number(weeklyWeek));
  const top = useTopFlagged(pid);
  const plan = useActionPlan(pid);
  const addPhoto = useAddActionPlanPhoto(pid);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(
        [
          queryKeys.insights.all,
          queryKeys.badges.all,
          queryKeys.reactions.all,
          queryKeys.actionPlan.all,
        ].map((key) => queryClient.invalidateQueries({ queryKey: key })),
      );
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const uploadPlanPhoto = useCallback(async () => {
    const uri = await pickDocumentPhoto();
    if (uri === 'denied') {
      showToast({ message: t('actionPlan.permissionDenied'), icon: 'alert' });
      return;
    }
    if (!uri) return;
    await addPhoto.mutateAsync(uri);
    showToast({ message: t('actionPlan.added'), icon: 'checkCircle' });
    router.push('/action-plan');
  }, [addPhoto, router, t]);

  const earned = badges.data?.filter((badge) => badge.earnedAt).length ?? 0;
  const weekOptions = WEEKS.map((key, index) => ({ key: String(index), label: t(key) }));
  const weekdayLabel = (date: string) =>
    fromDayKey(date).toLocaleDateString(i18n.language, { weekday: 'short' });

  const linePoints = useMemo(
    () =>
      (series.data ?? []).map((point) => ({
        value: point.flagged,
        label: formatShortDate(fromDayKey(point.date).toISOString(), i18n.language),
        tooltip: t('insights.tooltip', {
          date: formatShortDate(fromDayKey(point.date).toISOString(), i18n.language),
          flagged: point.flagged,
          total: point.total,
        }),
      })),
    [i18n.language, series.data, t],
  );
  const seriesTotal = (series.data ?? []).reduce((sum, point) => sum + point.total, 0);
  const seriesFlagged = (series.data ?? []).reduce((sum, point) => sum + point.flagged, 0);
  const safePercent = seriesTotal
    ? Math.round(((seriesTotal - seriesFlagged) / seriesTotal) * 100)
    : null;
  const encouragement =
    safePercent === null
      ? t('insights.encouragement_none')
      : safePercent >= 85
        ? t('insights.encouragement_high')
        : safePercent >= 60
          ? t('insights.encouragement_mid')
          : t('insights.encouragement_low');

  const dailyBars: StackedBar[] = (daily.data?.days ?? []).map((day) => ({
    label: weekdayLabel(day.date),
    segments: [
      { value: day.safe, color: 'success' },
      { value: day.caution + day.unknown, color: 'warning' },
      { value: day.unsafe, color: 'danger' },
    ],
  }));
  const weeklyBars: StackedBar[] = (weekly.data?.days ?? []).map((day) => ({
    label: weekdayLabel(day.date),
    segments: [
      { value: day.checked - day.flagged, color: 'success' },
      { value: day.flagged, color: 'warning' },
    ],
  }));

  const daysSince = overview.data?.daysSinceLastReaction ?? null;
  const longestRun = overview.data?.longestReactionFreeRun ?? 0;
  const reactionProgress =
    daysSince === null ? 0 : longestRun ? Math.min(1, daysSince / longestRun) : 1;
  const cautionIndex = Math.max(
    0,
    CAUTION_LEVELS.findIndex((level) => level.key === profile?.cautionLevel),
  );

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
      testID="insights"
    >
      {/* 1. Streak and badges */}
      <View style={styles.row}>
        {overview.data ? (
          <StatCard
            layout="square"
            value={overview.data.streak}
            label={t('insights.streak')}
            art={<Icon name="shieldCheck" size={rs(44)} color="success" />}
            accessibilityLabel={t('insights.streakA11y', { count: overview.data.streak })}
            onPress={() => streakRef.current?.present()}
            style={styles.half}
            testID="insights-streak"
          />
        ) : (
          <Skeleton height={rs(160)} radius={radii.lg} style={styles.half} />
        )}
        {badges.data ? (
          <StatCard
            layout="square"
            value={earned}
            label={t('insights.badges')}
            art={<Icon name="medal" size={rs(44)} color="gold" />}
            onPress={() => router.push('/badges')}
            style={styles.half}
            testID="insights-badges"
          />
        ) : (
          <Skeleton height={rs(160)} radius={radii.lg} style={styles.half} />
        )}
      </View>

      {/* 2. Reactions */}
      {overview.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void overview.refetch()}
          compact
        />
      ) : (
        <PressableScale
          onPress={() => router.push('/reactions')}
          haptic="light"
          pressedScale={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${t('insights.reactionsLabel')}: ${daysSince ?? t('insights.reactionsNone')}. ${t('insights.reactionsHint')}`}
          style={styles.card}
          testID="insights-reactions"
        >
          <View style={styles.cardTop}>
            <View style={styles.flex}>
              <Text variant="small" color="textMuted">
                {t('insights.reactionsLabel')}
              </Text>
              <Text variant="statLg" color="text">
                {daysSince === null ? '–' : daysSince}
              </Text>
            </View>
            <Button
              title={t('insights.logReaction')}
              size="sm"
              onPress={() => router.push('/reactions/new')}
              testID="insights-log-reaction"
            />
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(reactionProgress * 100)}%` }]} />
          </View>
          <Text variant="small" color="textMuted">
            {daysSince === null
              ? t('insights.reactionsNone')
              : t('insights.longestRun', { count: Math.max(longestRun, daysSince) })}
          </Text>
        </PressableScale>
      )}

      {/* 3. Flagged foods over time */}
      <ChartCard
        title={t('insights.flaggedTitle')}
        badge={
          safePercent !== null
            ? {
                label: t('insights.safeBadge', { percent: safePercent }),
                icon: 'flag',
                color: 'success',
                tint: 'successTint',
              }
            : undefined
        }
        footer={
          <View style={styles.footer}>
            <SegmentedControl
              variant="chips"
              options={RANGES.map((item) => ({ key: item.key, label: t(item.labelKey) }))}
              value={range}
              onChange={setRange}
            />
            <View style={styles.encouragement}>
              <Text variant="small" color="success">
                {encouragement}
              </Text>
            </View>
          </View>
        }
        style={styles.section}
        testID="insights-flagged"
      >
        {series.data ? (
          <LineChart
            points={linePoints}
            accessibilityLabel={t('insights.flaggedTitle')}
            emptyLabel={t('insights.encouragement_none')}
          />
        ) : (
          <Skeleton height={rs(160)} radius={radii.sm} />
        )}
      </ChartCard>

      {/* 4. Scan changes */}
      <ChartCard
        title={t('insights.changesTitle')}
        style={styles.section}
        testID="insights-changes"
      >
        {changes.data ? (
          changes.data.map((row, index) => {
            const trend = TREND_ICON[row.trend];
            return (
              <View key={row.window}>
                <PressableScale
                  onPress={() =>
                    router.push({ pathname: '/history', params: { range: row.window } })
                  }
                  disabled={!row.ready}
                  haptic="light"
                  pressedScale={0.99}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(`insights.window_${row.window}`)}: ${row.ready ? t('insights.flaggedCount', { count: row.flagged }) : t('insights.notReady')}, ${t(`insights.trend_${row.trend}`)}`}
                  accessibilityHint={row.ready ? t('insights.changesHint') : undefined}
                  style={[styles.changeRow, row.ready ? null : styles.pending]}
                >
                  <Text variant="body" color="textMuted" style={styles.changeLabel}>
                    {t(`insights.window_${row.window}`)}
                  </Text>
                  <Sparkline
                    values={row.series}
                    muted={!row.ready}
                    color={row.trend === 'more' ? 'danger' : 'info'}
                  />
                  <Text
                    variant="label"
                    color={row.ready ? 'text' : 'textMuted'}
                    style={styles.changeValue}
                  >
                    {row.ready
                      ? t('insights.flaggedCount', { count: row.flagged })
                      : t('insights.notReady')}
                  </Text>
                  <View style={styles.trend}>
                    <Icon
                      name={trend.icon}
                      size={rs(14)}
                      color={trend.color}
                      style={
                        row.trend === 'fewer'
                          ? styles.rotateDown
                          : row.trend === 'more'
                            ? styles.rotateUp
                            : undefined
                      }
                    />
                    <Text variant="small" color={trend.color}>
                      {t(`insights.trend_${row.trend}`)}
                    </Text>
                  </View>
                </PressableScale>
                {index < changes.data.length - 1 ? <Divider /> : null}
              </View>
            );
          })
        ) : (
          <Skeleton height={rs(200)} radius={radii.sm} />
        )}
      </ChartCard>

      {/* 5. Allergy action plan */}
      <Card variant="outlined" padding={spacing.lg} style={styles.section} testID="insights-plan">
        <Text variant="cardTitle" color="text" accessibilityRole="header">
          {t('insights.planTitle')}
        </Text>
        <View style={styles.planRow}>
          <PressableScale
            onPress={() => router.push('/action-plan')}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('insights.planTitle')}
          >
            <IconChip icon="document" size={64} iconSize={30} outline background="surfaceTint" />
          </PressableScale>
          <View style={styles.flex}>
            <Text variant="body" color="textMuted">
              {plan.data?.length
                ? t('insights.planCount', { count: plan.data.length })
                : t('insights.planBody')}
            </Text>
            <Button
              title={t('insights.planUpload')}
              variant="secondary"
              size="sm"
              leading={<Icon name="plus" size={rs(16)} color="text" />}
              loading={addPhoto.isPending}
              onPress={() => void uploadPlanPhoto()}
              style={styles.planButton}
              testID="insights-plan-upload"
            />
          </View>
        </View>
      </Card>

      {/* 6. Daily scans */}
      <ChartCard
        title={t('insights.dailyTitle')}
        figure={
          daily.data
            ? { value: String(daily.data.averagePerDay), unit: t('insights.dailyUnit') }
            : undefined
        }
        legend={[
          { label: t('insights.legend_safe'), color: 'success' },
          { label: t('insights.legend_caution'), color: 'warning' },
          { label: t('insights.legend_unsafe'), color: 'danger' },
        ]}
        footer={
          <SegmentedControl options={weekOptions} value={dailyWeek} onChange={setDailyWeek} />
        }
        style={styles.section}
        testID="insights-daily"
      >
        {daily.data ? (
          <StackedBarChart bars={dailyBars} accessibilityLabel={t('insights.dailyTitle')} />
        ) : (
          <Skeleton height={rs(180)} radius={radii.sm} />
        )}
      </ChartCard>

      {/* 7. Weekly overview */}
      <ChartCard
        title={t('insights.weeklyTitle')}
        legend={[
          { label: t('insights.legend_safe'), color: 'success' },
          { label: t('insights.legend_flagged'), color: 'warning' },
        ]}
        footer={
          <SegmentedControl options={weekOptions} value={weeklyWeek} onChange={setWeeklyWeek} />
        }
        style={styles.section}
        testID="insights-weekly"
      >
        {weekly.data ? (
          <>
            <View style={styles.figures}>
              <Figure label={t('insights.checked')} value={String(weekly.data.checked)} />
              <Figure label={t('insights.flagged')} value={String(weekly.data.flagged)} />
              <Figure
                label={t('insights.safeRate')}
                value={
                  weekly.data.safeRate === null ? '–' : `${Math.round(weekly.data.safeRate * 100)}%`
                }
              />
            </View>
            <StackedBarChart bars={weeklyBars} accessibilityLabel={t('insights.weeklyTitle')} />
          </>
        ) : (
          <Skeleton height={rs(220)} radius={radii.sm} />
        )}
      </ChartCard>

      {/* 8. Most flagged ingredients */}
      <ChartCard
        title={t('insights.topTitle')}
        locked={
          top.data && !top.data.unlocked
            ? {
                message: t('insights.topLocked', {
                  count: top.data.requiredDays,
                  done: top.data.daysWithScans,
                }),
              }
            : undefined
        }
        style={styles.section}
        testID="insights-top"
      >
        {top.data ? (
          top.data.items.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t('insights.topEmpty')}
            </Text>
          ) : (
            top.data.items.map((item, index) => (
              <View key={item.ingredientId}>
                <ListRow
                  label={`${index + 1}. ${item.name}`}
                  value={t('insights.topCount', { count: item.count })}
                  chevron={top.data?.unlocked}
                  onPress={
                    top.data?.unlocked
                      ? () =>
                          router.push({
                            pathname: '/ingredients/[id]',
                            params: { id: item.ingredientId },
                          })
                      : undefined
                  }
                />
                {index < top.data!.items.length - 1 ? <Divider /> : null}
              </View>
            ))
          )
        ) : (
          <Skeleton height={rs(120)} radius={radii.sm} />
        )}
      </ChartCard>

      {/* 9. Caution level */}
      <ChartCard
        title={t('insights.cautionTitle')}
        onHelp={() => router.push('/settings/verdict-colors')}
        helpLabel={t('insights.cautionHelp')}
        onPress={() => router.push('/settings/caution')}
        style={[styles.section, styles.last]}
        testID="insights-caution"
      >
        <View style={styles.statusRow}>
          <Text variant="stat" color="text">
            {cautionIndex + 1}/4
          </Text>
          <View style={styles.statusPill}>
            <Text variant="small" color="success">
              {t('insights.cautionStatus', {
                level: t(`insights.caution_${CAUTION_LEVELS[cautionIndex]?.key ?? 'ingredient'}`),
              })}
            </Text>
          </View>
        </View>
        <ScaleBar
          segments={CAUTION_LEVELS.map((level) => ({
            label: t(`insights.caution_${level.key}`),
            color: level.color,
          }))}
          markerIndex={cautionIndex}
          accessibilityLabel={t('insights.cautionStatus', {
            level: t(`insights.caution_${CAUTION_LEVELS[cautionIndex]?.key ?? 'ingredient'}`),
          })}
        />
        <Text variant="small" color="textMuted">
          {t('insights.cautionLegendHint')}
        </Text>
      </ChartCard>

      <StreakSheet
        ref={streakRef}
        profileId={pid}
        current={overview.data?.streak ?? 0}
        longest={overview.data?.longestStreak ?? 0}
      />
    </Screen>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.figure}>
      <Text variant="small" color="textMuted">
        {label}
      </Text>
      <Text variant="stat" color="text">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: rs(spacing.sm) },
  half: { flex: 1 },
  flex: { flex: 1 },
  section: { marginTop: rs(spacing.md) },
  last: { marginBottom: rs(spacing.md) },
  card: {
    marginTop: rs(spacing.md),
    padding: rs(spacing.lg),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: rs(spacing.sm),
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(spacing.sm) },
  track: {
    height: rs(8),
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.successBright },
  footer: { gap: rs(spacing.sm) },
  encouragement: {
    alignSelf: 'flex-start',
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(6),
    borderRadius: radii.pill,
    backgroundColor: colors.successTint,
  },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm), minHeight: rs(44) },
  changeLabel: { width: rs(64) },
  changeValue: { flex: 1 },
  pending: { opacity: 0.45 },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: rs(92),
    justifyContent: 'flex-end',
  },
  rotateDown: { transform: [{ rotate: '45deg' }] },
  rotateUp: { transform: [{ rotate: '-45deg' }] },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.md),
    marginTop: rs(spacing.sm),
  },
  planButton: {
    alignSelf: 'flex-start',
    marginTop: rs(spacing.sm),
    paddingHorizontal: rs(spacing.md),
  },
  figures: { flexDirection: 'row', gap: rs(spacing.lg), marginBottom: rs(spacing.xs) },
  figure: { gap: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.sm) },
  statusPill: {
    paddingHorizontal: rs(spacing.sm),
    paddingVertical: rs(4),
    borderRadius: radii.pill,
    backgroundColor: colors.successTint,
  },
});
