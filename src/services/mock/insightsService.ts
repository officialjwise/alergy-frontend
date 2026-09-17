import { activityFor, healthConnection, waterFor } from './activityService';
import { BADGE_RULES, mockBadgeService } from './badgeService';
import { mockHistoryService } from './historyService';
import { simulate } from './support';
import { listWeights } from './weightService';
import type { InsightsService } from '../types';
import {
  bmiCategory,
  computeBmi,
  dayHealthScore,
  goalDate,
  goalPercent,
  macroCalories,
  ringStatus,
  sumNutrition,
} from '@/features/tracking/nutrition';
import { bodyOf, goalsOf } from '@/features/tracking/profile';
import { computeLogStreak, longestLogStreak } from '@/features/tracking/streaks';
import { useAppStore } from '@/store/appStore';
import { useProfileStore } from '@/store/profileStore';
import type {
  DailyCaloriesDay,
  DayNutrition,
  ExpenditureRow,
  InsightsRange,
  ScanResult,
  ScanWindow,
  WeightChangeRow,
  WeightGoalProgress,
} from '@/types';
import { addDays, dayKey, daysBetween, fromDayKey } from '@/utils/date';

/**
 * Everything on Home and Insights is derived from the logged foods, the
 * weight log and the activity data, so the screens always agree with each other.
 */

const WINDOWS: { key: ScanWindow; days: number | null }[] = [
  { key: '3d', days: 3 },
  { key: '7d', days: 7 },
  { key: '14d', days: 14 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
  { key: 'all', days: null },
];

const RANGE_DAYS: Record<InsightsRange, number | null> = {
  '90d': 90,
  '6m': 182,
  '1y': 364,
  all: null,
};

const isFlagged = (scan: ScanResult) =>
  scan.verdict.kind === 'unsafe' || scan.verdict.kind === 'caution';

const loggedDaysOf = (scans: ScanResult[]): Set<string> =>
  new Set(scans.map((scan) => dayKey(scan.scannedAt)));

/** Sunday of the week containing `date`, `offset` weeks back. */
function weekStartFor(today: Date, offset: number): Date {
  const start = addDays(today, -today.getDay() - offset * 7);
  return fromDayKey(dayKey(start));
}

function nutritionFor(profileId: string, date: string, scans: ScanResult[]): DayNutrition {
  const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId) ?? null;
  const goals = goalsOf(profile);
  const inDay = scans.filter((scan) => dayKey(scan.scannedAt) === date);
  const eaten = sumNutrition(inDay.map((scan) => scan.product.nutrition));
  const activity = activityFor(profileId, date);
  const addBurned = useAppStore.getState().preferences.addBurnedCalories;
  const budget = goals.calories + (addBurned ? activity.caloriesBurned : 0);
  return {
    date,
    eaten,
    goals,
    budget,
    burned: activity.caloriesBurned,
    steps: activity.steps,
    mealsLogged: inDay.length,
    status: ringStatus(eaten.calories, budget, inDay.length),
    healthScore: dayHealthScore(inDay.map((scan) => scan.product.healthScore)),
  };
}

function weightProgress(profileId: string): WeightGoalProgress | null {
  const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId) ?? null;
  const body = bodyOf(profile);
  const entries = listWeights(profileId);
  const current = entries[entries.length - 1]?.weightLbs ?? body.currentWeightLbs;
  if (current === null) return null;
  const start = entries[0]?.weightLbs ?? current;
  const goal = body.goalWeightLbs;
  return {
    startLbs: start,
    currentLbs: current,
    goalLbs: goal,
    percent: goal === null ? 0 : goalPercent(start, current, goal),
    goalDate: goalDate(current, goal),
  };
}

const dayCalories = (scans: ScanResult[], key: string) =>
  sumNutrition(
    scans.filter((scan) => dayKey(scan.scannedAt) === key).map((scan) => scan.product.nutrition),
  );

export const mockInsightsService: InsightsService = {
  async homeDashboard(profileId, date) {
    await simulate(0.4);
    const scans = await mockHistoryService.list(profileId);
    const logged = loggedDaysOf(scans);
    return {
      day: nutritionFor(profileId, date, scans),
      streak: computeLogStreak(logged, dayKey(new Date())),
      longestStreak: longestLogStreak(logged),
      water: waterFor(profileId, date),
      activity: activityFor(profileId, date),
      health: healthConnection(),
    };
  },

  async dayNutrition(profileId, fromDate, toDate) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const count = Math.max(0, daysBetween(fromDate, toDate)) + 1;
    return Array.from({ length: count }, (_, index) =>
      nutritionFor(profileId, dayKey(addDays(fromDayKey(fromDate), index)), scans),
    );
  },

  async trackingOverview(profileId) {
    await simulate(0.4);
    const [scans, badges] = await Promise.all([
      mockHistoryService.list(profileId),
      mockBadgeService.list(profileId),
    ]);
    const logged = loggedDaysOf(scans);
    const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId) ?? null;
    const body = bodyOf(profile);
    const weight = weightProgress(profileId);
    const bmi = computeBmi(weight?.currentLbs ?? body.currentWeightLbs, body.heightInches);
    return {
      streak: computeLogStreak(logged, dayKey(new Date())),
      longestStreak: longestLogStreak(logged),
      badgesEarned: badges.filter((badge) => badge.earnedAt !== null).length,
      badgesTotal: BADGE_RULES.length,
      mealsLogged: scans.length,
      flaggedMeals: scans.filter(isFlagged).length,
      daysWithLogs: logged.size,
      weight,
      bmi: { value: bmi, category: bmiCategory(bmi) },
    };
  },

  async weightSeries(profileId, range) {
    await simulate(0.3);
    const entries = listWeights(profileId);
    const days = RANGE_DAYS[range];
    const from = days === null ? null : dayKey(addDays(new Date(), -days));
    return entries
      .filter((entry) => from === null || dayKey(entry.loggedAt) >= from)
      .map((entry) => ({ date: dayKey(entry.loggedAt), weightLbs: entry.weightLbs }));
  },

  async weightChanges(profileId) {
    await simulate(0.3);
    const entries = listWeights(profileId);
    const today = dayKey(new Date());
    const latest = entries[entries.length - 1];
    return WINDOWS.map<WeightChangeRow>(({ key, days }) => {
      if (!latest) {
        return { window: key, changeLbs: null, trend: 'pending', series: [], ready: false };
      }
      const from = days === null ? null : dayKey(addDays(fromDayKey(today), -(days - 1)));
      const inWindow = entries.filter((entry) => from === null || dayKey(entry.loggedAt) >= from);
      const before =
        from === null
          ? undefined
          : [...entries].reverse().find((entry) => dayKey(entry.loggedAt) < from);
      const baseline = before ?? inWindow[0] ?? latest;
      const change = Math.round((latest.weightLbs - baseline.weightLbs) * 10) / 10;
      return {
        window: key,
        changeLbs: change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
        series: (inWindow.length ? inWindow : [latest]).map((entry) => entry.weightLbs),
        ready: true,
      };
    });
  },

  async dailyCalories(profileId, weekOffset) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const start = weekStartFor(fromDayKey(dayKey(new Date())), weekOffset);
    const days = Array.from({ length: 7 }, (_, index): DailyCaloriesDay => {
      const key = dayKey(addDays(start, index));
      const eaten = dayCalories(scans, key);
      return { date: key, calories: eaten.calories, ...macroCalories(eaten) };
    });
    const withLogs = days.filter((day) => day.calories > 0);
    const total = withLogs.reduce((sum, day) => sum + day.calories, 0);
    return {
      weekStart: dayKey(start),
      days,
      average: withLogs.length ? Math.round(total / withLogs.length) : 0,
      hasData: withLogs.length > 0,
    };
  },

  async weeklyEnergy(profileId, weekOffset) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const start = weekStartFor(fromDayKey(dayKey(new Date())), weekOffset);
    const days = Array.from({ length: 7 }, (_, index) => {
      const key = dayKey(addDays(start, index));
      return {
        date: key,
        burned: activityFor(profileId, key).caloriesBurned,
        consumed: dayCalories(scans, key).calories,
      };
    });
    return {
      weekStart: dayKey(start),
      burned: days.reduce((sum, day) => sum + day.burned, 0),
      consumed: days.reduce((sum, day) => sum + day.consumed, 0),
      days,
    };
  },

  async expenditureChanges(profileId) {
    await simulate(0.3);
    const health = healthConnection();
    const today = fromDayKey(dayKey(new Date()));
    const dataDays = health.connectedAt
      ? daysBetween(dayKey(health.connectedAt), dayKey(today)) + 1
      : 0;
    return WINDOWS.filter((window) => window.days !== null).map<ExpenditureRow>(
      ({ key, days }) => {
        const span = days ?? 1;
        if (!health.connected || dataDays < span) {
          return { window: key, burned: null, trend: 'pending', ready: false };
        }
        const burned = Array.from(
          { length: span },
          (_, index) => activityFor(profileId, dayKey(addDays(today, -index))).caloriesBurned,
        );
        const average = Math.round(burned.reduce((sum, value) => sum + value, 0) / span);
        return { window: key, burned: average, trend: 'same', ready: true };
      },
    );
  },
};
