import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { FeatureIntroSheet, type FeatureIntroRow } from '@/components/app/FeatureIntroSheet';
import { ProfileSwitcherSheet } from '@/components/app/ProfileSwitcherSheet';
import {
  ErrorState,
  Screen,
  SectionHeader,
  showToast,
  Skeleton,
  useSheetRef,
  type IconName,
} from '@/components/ui';
import { ActivityPage } from '@/features/home/components/ActivityPage';
import { CaloriesCard, type NutrientMetric } from '@/features/home/components/CaloriesCard';
import { EmptyRecentCard } from '@/features/home/components/EmptyRecentCard';
import { FoodRow } from '@/features/home/components/FoodRow';
import { HealthScoreCard } from '@/features/home/components/HealthScoreCard';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { HomePager } from '@/features/home/components/HomePager';
import { LogWaterSheet } from '@/features/home/components/LogWaterSheet';
import { NutrientCard } from '@/features/home/components/NutrientCard';
import { WeekStrip } from '@/features/home/components/WeekStrip';
import { useRecentScans } from '@/features/home/useHome';
import { useConnectHealth, useHomeDashboard, useLogWater } from '@/features/tracking/useTracking';
import { queryKeys } from '@/services/queryClient';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { colors, radii, spacing, type ColorToken } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { Nutrition, ScanResult } from '@/types';
import { dayKey, formatShortDate, fromDayKey } from '@/utils/date';

type NutrientKey = keyof Nutrition;

const MACROS: { key: NutrientKey; unit: string; color: ColorToken; icon: IconName }[] = [
  { key: 'protein', unit: 'g', color: 'protein', icon: 'drumstick' },
  { key: 'carbs', unit: 'g', color: 'carbs', icon: 'grain' },
  { key: 'fat', unit: 'g', color: 'fat', icon: 'drop' },
];

const MICROS: { key: NutrientKey; unit: string; color: ColorToken; icon: IconName }[] = [
  { key: 'fiber', unit: 'g', color: 'fiber', icon: 'fiberLeaf' },
  { key: 'sugar', unit: 'g', color: 'sugar', icon: 'candy' },
  { key: 'sodium', unit: 'mg', color: 'sodium', icon: 'salt' },
];

/**
 * Home: streak calendar, the three-page dashboard (calories and macros;
 * micronutrients and health score; Apple Health, burn, steps and water) and
 * the recently uploaded foods.
 */
export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  const profileCount = useProfileStore((state) => state.profiles.length);
  const workoutsIntroShown = useAppStore((state) => state.workoutsIntroShown);
  const setWorkoutsIntroShown = useAppStore((state) => state.setWorkoutsIntroShown);

  const today = dayKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [metric, setMetric] = useState<NutrientMetric>('eaten');
  const [refreshing, setRefreshing] = useState(false);
  const switcherRef = useSheetRef();
  const introRef = useSheetRef();
  const waterRef = useSheetRef();

  const dashboard = useHomeDashboard(profile?.id ?? null, selectedDate);
  const recent = useRecentScans(profile?.id ?? null, selectedDate);
  const connect = useConnectHealth();
  const logWater = useLogWater();
  const isToday = selectedDate === today;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all }),
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

  const dismissIntro = useCallback(() => {
    setWorkoutsIntroShown();
    introRef.current?.dismiss();
  }, [introRef, setWorkoutsIntroShown]);

  const connectHealth = useCallback(async () => {
    try {
      await connect.mutateAsync(true);
      showToast({ message: t('appleHealth.connected'), icon: 'heart' });
    } catch {
      showToast({ message: t('appleHealth.failed'), icon: 'alert' });
    } finally {
      dismissIntro();
    }
  }, [connect, dismissIntro, t]);

  const onPageChange = useCallback(
    (index: number) => {
      if (index === 2 && !workoutsIntroShown && !dashboard.data?.health.connected) {
        setTimeout(() => introRef.current?.present(), 250);
      }
    },
    [dashboard.data?.health.connected, introRef, workoutsIntroShown],
  );

  const saveWater = useCallback(
    async (ounces: number) => {
      if (!profile) return;
      try {
        await logWater.mutateAsync({ profileId: profile.id, date: selectedDate, ounces });
        waterRef.current?.dismiss();
        showToast({ message: t('water.saved'), icon: 'cup' });
      } catch {
        showToast({ message: t('states.errorTitle'), icon: 'alert' });
      }
    },
    [logWater, profile, selectedDate, t, waterRef],
  );

  const introRows = useMemo<FeatureIntroRow[]>(
    () => [
      {
        icon: 'run',
        title: t('workoutsIntro.run'),
        detail: t('workoutsIntro.fromHealth', { minutes: 32 }),
        status: '+320 cal',
        statusColor: 'success',
      },
      {
        icon: 'yoga',
        title: t('workoutsIntro.yoga'),
        detail: t('workoutsIntro.fromHealth', { minutes: 20 }),
        status: '+90 cal',
        statusColor: 'success',
      },
      {
        icon: 'steps',
        title: t('workoutsIntro.steps'),
        detail: t('workoutsIntro.stepsToday', { count: 12430 }),
        status: '+80 cal',
        statusColor: 'success',
      },
    ],
    [t],
  );

  const day = dashboard.data?.day;
  const budget = day?.budget ?? 0;
  const nutrientValue = (key: NutrientKey) => {
    if (!day) return 0;
    const eaten = day.eaten[key];
    return metric === 'eaten' ? eaten : Math.max(0, day.goals[key] - eaten);
  };
  const nutrientLabel = (key: NutrientKey) =>
    t(metric === 'eaten' ? 'home.nutrientEaten' : 'home.nutrientLeft', {
      name: t(`home.nutrient_${key}`),
    });
  const progress = (key: NutrientKey) =>
    day && day.goals[key] > 0 ? Math.min(1, day.eaten[key] / day.goals[key]) : 0;

  const pages = dashboard.data
    ? [
        <View key="calories" style={styles.page}>
          <CaloriesCard
            eaten={day?.eaten.calories ?? 0}
            budget={budget}
            metric={metric}
            label={t(metric === 'eaten' ? 'home.caloriesEaten' : 'home.caloriesLeft')}
            toggleHint={t('home.toggleMetric')}
            onToggle={() => setMetric((current) => (current === 'eaten' ? 'left' : 'eaten'))}
            testID="home-calories"
          />
          <View style={styles.cardRow}>
            {MACROS.map((macro) => (
              <NutrientCard
                key={macro.key}
                value={nutrientValue(macro.key)}
                goal={day?.goals[macro.key] ?? 0}
                unit={macro.unit}
                label={nutrientLabel(macro.key)}
                progress={progress(macro.key)}
                color={macro.color}
                icon={macro.icon}
                testID={`home-${macro.key}`}
              />
            ))}
          </View>
        </View>,
        <View key="micros" style={styles.page}>
          <View style={styles.cardRow}>
            {MICROS.map((micro) => (
              <NutrientCard
                key={micro.key}
                value={nutrientValue(micro.key)}
                goal={day?.goals[micro.key] ?? 0}
                unit={micro.unit}
                label={nutrientLabel(micro.key)}
                progress={progress(micro.key)}
                color={micro.color}
                icon={micro.icon}
                testID={`home-${micro.key}`}
              />
            ))}
          </View>
          <HealthScoreCard
            title={t('home.healthScore')}
            score={day?.healthScore ?? null}
            notAvailableLabel={t('home.notAvailable')}
            body={
              day?.healthScore === null || day?.healthScore === undefined
                ? t('home.healthScoreEmpty')
                : t('home.healthScoreBody')
            }
            testID="home-health-score"
          />
        </View>,
        <ActivityPage
          key="activity"
          health={dashboard.data.health}
          activity={dashboard.data.activity}
          water={dashboard.data.water}
          connecting={connect.isPending}
          onConnect={() => introRef.current?.present()}
          onManage={() => router.push('/settings/apple-health')}
          onLogWater={() => waterRef.current?.present()}
          labels={{
            connectTitle: t('home.connectHealth'),
            connectBody: t('home.trackSteps'),
            connect: t('home.connect'),
            connectedTitle: t('home.healthConnected'),
            connectedBody: t('home.healthSyncing'),
            manage: t('home.manage'),
            caloriesBurned: t('home.caloriesBurned'),
            steps: t('home.steps'),
            cal: t('home.cal'),
            water: t('home.water'),
            waterValue: (ounces, cups) => t('home.waterValue', { ounces, cups }),
            logWater: t('home.logWater'),
          }}
        />,
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
          streak={dashboard.data?.streak ?? 0}
          onStreakPress={() => router.push('/milestones')}
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

      {dashboard.isError ? (
        <ErrorState
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={() => void dashboard.refetch()}
          compact
        />
      ) : !dashboard.data ? (
        <View style={styles.page}>
          <Skeleton height={rs(152)} radius={radii.lg} />
          <View style={styles.cardRow}>
            <Skeleton height={rs(156)} radius={radii.lg} style={styles.flex} />
            <Skeleton height={rs(156)} radius={radii.lg} style={styles.flex} />
            <Skeleton height={rs(156)} radius={radii.lg} style={styles.flex} />
          </View>
        </View>
      ) : (
        <HomePager
          pages={pages}
          a11yLabel={(current, total) => t('home.statsA11y', { current, total })}
          onPageChange={onPageChange}
          testID="home-pager"
        />
      )}

      <View style={styles.section}>
        <SectionHeader
          title={recentTitle}
          actionLabel={recent.items.length ? t('common.seeAll') : undefined}
          onAction={() => router.push('/history')}
        />
        {recent.isLoading && !recent.data ? (
          <View style={styles.list}>
            <Skeleton height={rs(96)} radius={radii.lg} />
            <Skeleton height={rs(96)} radius={radii.lg} />
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
              <FoodRow key={scan.id} scan={scan} onPress={openScan} />
            ))}
          </View>
        )}
      </View>

      <ProfileSwitcherSheet ref={switcherRef} />
      <FeatureIntroSheet
        ref={introRef}
        icon="run"
        title={t('workoutsIntro.title')}
        subtitle={t('workoutsIntro.subtitle', { app: t('home.appName') })}
        rows={introRows}
        summary={{ label: t('workoutsIntro.summaryLabel'), value: '+490 cal' }}
        footnote={t('workoutsIntro.budget', {
          from: (day?.goals.calories ?? 0).toLocaleString(),
          to: ((day?.goals.calories ?? 0) + 490).toLocaleString(),
        })}
        primaryLabel={t('workoutsIntro.connect')}
        onPrimary={() => void connectHealth()}
        primaryLoading={connect.isPending}
        secondaryLabel={t('common.notNow')}
        onSecondary={dismissIntro}
        closeLabel={t('common.close')}
        onDismiss={setWorkoutsIntroShown}
        testID="workouts-intro"
      />
      <LogWaterSheet
        ref={waterRef}
        ounces={dashboard.data?.water.ounces ?? 0}
        saving={logWater.isPending}
        onSave={(ounces) => void saveWater(ounces)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  strip: { marginTop: rs(spacing.md), marginBottom: rs(spacing.lg) },
  page: { gap: rs(spacing.sm) },
  cardRow: { flexDirection: 'row', gap: rs(spacing.sm) },
  flex: { flex: 1 },
  section: { marginTop: rs(spacing.xl) },
  list: { gap: rs(spacing.sm) },
});
