import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { FeatureIntroSheet, type FeatureIntroRow } from '@/components/app/FeatureIntroSheet';
import { ProfileSwitcherSheet } from '@/components/app/ProfileSwitcherSheet';
import { ScanRow } from '@/components/app/ScanRow';
import {
  ErrorState,
  Icon,
  Screen,
  SectionHeader,
  showToast,
  Skeleton,
  StatCard,
  useSheetRef,
} from '@/components/ui';
import { EmptyRecentCard } from '@/features/home/components/EmptyRecentCard';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { StatPager, type StatPagerProps } from '@/features/home/components/StatPager';
import { WeekStrip } from '@/features/home/components/WeekStrip';
import { useHomeSummary, useRecentScans } from '@/features/home/useHome';
import { queryKeys } from '@/services/queryClient';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { ScanResult } from '@/types';
import { dayKey, formatShortDate, fromDayKey } from '@/utils/date';

type HeroMetric = 'count' | 'rate';

/** Home dashboard: week strip, hero metric, swipeable stat cards and the recently scanned list. */
export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  const profileCount = useProfileStore((state) => state.profiles.length);
  const featureIntroShown = useAppStore((state) => state.featureIntroShown);
  const setFeatureIntroShown = useAppStore((state) => state.setFeatureIntroShown);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);

  const today = dayKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [metric, setMetric] = useState<HeroMetric>('count');
  const [refreshing, setRefreshing] = useState(false);
  const [enablingAlerts, setEnablingAlerts] = useState(false);
  const switcherRef = useSheetRef();
  const introRef = useSheetRef();

  const summary = useHomeSummary(profile?.id ?? null, selectedDate);
  const recent = useRecentScans(profile?.id ?? null, selectedDate);
  const isToday = selectedDate === today;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights.all }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const openScan = useCallback(
    (scan: ScanResult) =>
      router.push({ pathname: '/scan/result/[id]', params: { id: scan.id, from: 'home' } }),
    [router],
  );
  const openScanner = useCallback(() => router.push('/scan'), [router]);

  // Product alerts intro: once, the first time the dashboard sees a saved food.
  const savedCount = summary.data?.savedCount ?? 0;
  useEffect(() => {
    if (featureIntroShown || savedCount === 0) return;
    const timeout = setTimeout(() => introRef.current?.present(), 700);
    return () => clearTimeout(timeout);
  }, [featureIntroShown, introRef, savedCount]);

  const introRows = useMemo<FeatureIntroRow[]>(() => {
    const saved = (recent.data ?? []).filter((scan) => scan.saved).slice(0, 3);
    const statuses: { key: string; color: FeatureIntroRow['statusColor'] }[] = [
      { key: 'home.intro.statusChanged', color: 'warning' },
      { key: 'home.intro.statusSafe', color: 'success' },
      { key: 'home.intro.statusSafe', color: 'success' },
    ];
    return saved.map((scan, index) => {
      const status = statuses[index] ?? statuses[1]!;
      return {
        icon: 'bookmark',
        title: scan.product.name,
        detail: scan.product.brand ?? t('home.intro.sampleDetail'),
        status: t(status.key),
        statusColor: status.color,
      };
    });
  }, [recent.data, t]);

  const dismissIntro = useCallback(() => {
    setFeatureIntroShown();
    introRef.current?.dismiss();
  }, [introRef, setFeatureIntroShown]);

  const enableAlerts = useCallback(async () => {
    setEnablingAlerts(true);
    try {
      const result = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(result.granted);
      showToast({
        message: result.granted ? t('home.intro.alertsOn') : t('home.intro.alertsDenied'),
        icon: result.granted ? 'bell' : 'alert',
      });
    } catch {
      setNotificationsEnabled(false);
      showToast({ message: t('home.intro.alertsDenied'), icon: 'alert' });
    } finally {
      setEnablingAlerts(false);
      dismissIntro();
    }
  }, [dismissIntro, setNotificationsEnabled, t]);

  const day = summary.data?.day;
  const total = day?.total ?? 0;
  const safeRate = summary.data?.safeRate ?? null;
  const heroValue =
    metric === 'count' ? total : safeRate === null ? '–' : `${Math.round(safeRate * 100)}%`;
  const heroLabel =
    metric === 'count'
      ? isToday
        ? t('home.foodsChecked')
        : t('home.foodsCheckedDay')
      : isToday
        ? t('home.safeRate')
        : t('home.safeRateDay');

  const share = (count: number) => (total ? count / total : 0);
  const topFlagged = summary.data?.topFlagged ?? null;
  const pages: StatPagerProps['pages'] = summary.data
    ? [
        [
          {
            key: 'safe',
            value: day?.safe ?? 0,
            label: t('home.statSafe'),
            ring: { progress: share(day?.safe ?? 0), color: 'success', icon: 'checkCircle' },
            onPress: () => router.push({ pathname: '/history', params: { verdict: 'safe' } }),
          },
          {
            key: 'caution',
            value: day?.caution ?? 0,
            label: t('home.statCaution'),
            ring: { progress: share(day?.caution ?? 0), color: 'warning', icon: 'warning' },
            onPress: () => router.push({ pathname: '/history', params: { verdict: 'caution' } }),
          },
          {
            key: 'unsafe',
            value: day?.unsafe ?? 0,
            label: t('home.statUnsafe'),
            ring: { progress: share(day?.unsafe ?? 0), color: 'danger', icon: 'closeCircle' },
            onPress: () => router.push({ pathname: '/history', params: { verdict: 'unsafe' } }),
          },
        ],
        [
          {
            key: 'unknown',
            value: day?.unknown ?? 0,
            label: t('home.statUnknown'),
            ring: { progress: share(day?.unknown ?? 0), color: 'neutral', icon: 'helpCircle' },
            onPress: () => router.push({ pathname: '/history', params: { verdict: 'unknown' } }),
          },
          {
            key: 'saved',
            value: summary.data.savedCount,
            label: t('home.statSavedFoods'),
            ring: { progress: summary.data.savedCount ? 1 : 0, color: 'primary', icon: 'bookmark' },
            onPress: () => router.push('/saved'),
          },
          {
            key: 'flagged',
            value: topFlagged?.name ?? '–',
            label: t('home.statTopFlagged'),
            caption: topFlagged
              ? t('home.statTopFlaggedCount', { count: topFlagged.count })
              : t('home.statTopFlaggedNone'),
            ring: { progress: topFlagged ? 1 : 0, color: 'warning', icon: 'flag' },
            onPress: topFlagged
              ? () =>
                  router.push({
                    pathname: '/ingredients/[id]',
                    params: { id: topFlagged.ingredientId },
                  })
              : undefined,
          },
        ],
        [
          {
            key: 'streak',
            value: summary.data.streak,
            label: t('home.statStreak'),
            ring: {
              progress: Math.min(1, summary.data.streak / 7),
              color: 'success',
              icon: 'shieldCheck',
            },
            onPress: () => router.push('/(tabs)/insights'),
          },
          {
            key: 'total',
            value: summary.data.totalScans,
            label: t('home.statChecked'),
            ring: { progress: summary.data.totalScans ? 1 : 0, color: 'info', icon: 'scan' },
            onPress: () => router.push('/history'),
          },
          {
            key: 'watching',
            value: profile?.restrictions.length ?? 0,
            label: t('home.statWatching'),
            ring: {
              progress: profile?.restrictions.length ? 1 : 0,
              color: 'primary',
              icon: 'eyeOff',
            },
            onPress: () => router.push('/settings/restrictions'),
          },
        ],
      ]
    : [];

  const recentTitle = isToday
    ? t('home.recentTitle')
    : t('home.dayTitle', {
        date: formatShortDate(fromDayKey(selectedDate).toISOString(), i18n.language),
      });

  return (
    <Screen
      tabBar
      header={
        <HomeHeader
          streak={summary.data?.streak ?? 0}
          onStreakPress={() => router.push('/(tabs)/insights')}
          profile={profile}
          showSwitcher={profileCount > 1}
          onSwitchPress={() => switcherRef.current?.present()}
        />
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.textMuted}
            title={t('home.refresh')}
          />
        ),
      }}
      testID="home-screen"
    >
      <View style={styles.strip}>
        <WeekStrip
          profileId={profile?.id ?? null}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>

      {summary.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void summary.refetch()}
          compact
        />
      ) : !summary.data ? (
        <View style={styles.block}>
          <Skeleton height={rs(148)} radius={radii.lg} />
          <View style={styles.skeletonRow}>
            <Skeleton height={rs(150)} radius={radii.lg} style={styles.flex} />
            <Skeleton height={rs(150)} radius={radii.lg} style={styles.flex} />
            <Skeleton height={rs(150)} radius={radii.lg} style={styles.flex} />
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <StatCard
            layout="hero"
            value={heroValue}
            label={heroLabel}
            caption={total === 0 ? t('home.noScansYet') : undefined}
            labelTrailing={<Icon name="chevronDown" size={rs(16)} color="textMuted" />}
            ring={{ progress: safeRate ?? 0, color: 'success', icon: 'shieldCheck' }}
            onPress={() => setMetric((current) => (current === 'count' ? 'rate' : 'count'))}
            accessibilityLabel={`${heroLabel}: ${heroValue}. ${t('home.toggleMetric')}`}
            testID="home-hero"
          />
          <StatPager pages={pages} testID="home-stats" />
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader
          title={recentTitle}
          actionLabel={recent.items.length ? t('common.seeAll') : undefined}
          onAction={() => router.push('/history')}
        />
        {recent.isLoading && !recent.data ? (
          <View style={styles.list}>
            <Skeleton height={rs(92)} radius={radii.card} />
            <Skeleton height={rs(92)} radius={radii.card} />
          </View>
        ) : recent.isError ? (
          <ErrorState
            title={t('states.errorTitle')}
            body={t('states.errorBody')}
            actionLabel={t('common.retry')}
            onAction={() => void recent.refetch()}
            compact
          />
        ) : recent.items.length === 0 ? (
          <EmptyRecentCard
            onPress={openScanner}
            variant={(recent.data?.length ?? 0) === 0 ? 'first' : 'day'}
          />
        ) : (
          <View style={styles.list}>
            {recent.items.map((scan) => (
              <ScanRow key={scan.id} scan={scan} onPress={openScan} showTriggers />
            ))}
          </View>
        )}
      </View>

      <ProfileSwitcherSheet ref={switcherRef} />
      <FeatureIntroSheet
        ref={introRef}
        icon="bell"
        title={t('home.intro.title')}
        subtitle={t('home.intro.subtitle')}
        rows={introRows}
        summary={{
          label: t('home.intro.summaryLabel'),
          value: t('home.intro.summaryValue', { count: Math.max(1, introRows.length - 1) }),
        }}
        footnote={t('home.intro.watched', { count: savedCount })}
        primaryLabel={t('home.intro.turnOn')}
        onPrimary={() => void enableAlerts()}
        primaryLoading={enablingAlerts}
        secondaryLabel={t('common.notNow')}
        onSecondary={dismissIntro}
        closeLabel={t('common.close')}
        onDismiss={setFeatureIntroShown}
        testID="feature-intro"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  strip: { marginTop: rs(spacing.md), marginBottom: rs(spacing.lg) },
  block: { gap: rs(spacing.sm) },
  skeletonRow: { flexDirection: 'row', gap: rs(spacing.sm) },
  flex: { flex: 1 },
  section: { marginTop: rs(spacing.xl) },
  list: { gap: rs(spacing.sm) },
});
