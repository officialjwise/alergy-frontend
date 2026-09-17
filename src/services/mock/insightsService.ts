import { activityFor, healthConnection, waterFor } from './activityService';
import { BADGE_RULES, mockBadgeService } from './badgeService';
import { mockHistoryService } from './historyService';
import { mockReactionService } from './reactionService';
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
import { useAppStore } from '@/store/appStore';
import { useProfileStore } from '@/store/profileStore';
import type {
  DailyCaloriesDay,
  DayNutrition,
  DaySummary,
  ExpenditureRow,
  FlaggedIngredientCount,
  InsightsRange,
  ScanChangeRow,
  ScanResult,
  ScanWindow,
  SeriesPoint,
  WeightChangeRow,
  WeightGoalProgress,
} from '@/types';
import { addDays, dayKey, daysBetween, fromDayKey } from '@/utils/date';

/** Everything on the dashboard and Insights is derived from the scan history, so it stays consistent with it. */

const TOP_FLAGGED_REQUIRED_DAYS = 7;
const WINDOWS: { key: ScanWindow; days: number | null }[] = [
  { key: '3d', days: 3 },
  { key: '7d', days: 7 },
  { key: '14d', days: 14 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
  { key: 'all', days: null },
];

function emptyDay(date: string): DaySummary {
  return { date, total: 0, safe: 0, caution: 0, unsafe: 0, unknown: 0 };
}

const isFlagged = (scan: ScanResult) =>
  scan.verdict.kind === 'unsafe' || scan.verdict.kind === 'caution';

function summarise(scans: ScanResult[]): Map<string, DaySummary> {
  const days = new Map<string, DaySummary>();
  for (const scan of scans) {
    const key = dayKey(scan.scannedAt);
    const day = days.get(key) ?? emptyDay(key);
    day.total += 1;
    day[scan.verdict.kind] += 1;
    days.set(key, day);
  }
  return days;
}

/** Consecutive days with at least one scan and nothing unsafe, ending today or yesterday. */
export function computeStreak(days: Map<string, DaySummary>, today: string): number {
  let cursor = today;
  const todayDay = days.get(today);
  if (!todayDay || todayDay.total === 0) cursor = dayKey(addDays(fromDayKey(today), -1));
  let streak = 0;
  for (;;) {
    const day = days.get(cursor);
    if (!day || day.total === 0 || day.unsafe > 0) break;
    streak += 1;
    cursor = dayKey(addDays(fromDayKey(cursor), -1));
    if (streak > 3650) break;
  }
  return streak;
}

/** Longest run of consecutive safe scanning days anywhere in the history. */
export function longestStreak(days: Map<string, DaySummary>): number {
  const keys = [...days.keys()].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of keys) {
    const day = days.get(key);
    if (!day || day.total === 0 || day.unsafe > 0) {
      run = 0;
      previous = null;
      continue;
    }
    run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

export function topFlaggedIngredient(scans: ScanResult[]): FlaggedIngredientCount | null {
  return rankFlagged(scans)[0] ?? null;
}

export function rankFlagged(scans: ScanResult[]): FlaggedIngredientCount[] {
  const counts = new Map<string, FlaggedIngredientCount>();
  for (const scan of scans) {
    for (const trigger of scan.verdict.triggers) {
      if (trigger.ingredientId === 'unclear') continue;
      const current = counts.get(trigger.ingredientId) ?? {
        ingredientId: trigger.ingredientId,
        name: trigger.ingredientName,
        count: 0,
      };
      current.count += 1;
      counts.set(trigger.ingredientId, current);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/** Sunday of the week containing `date`, `offset` weeks back. */
function weekStartFor(today: Date, offset: number): Date {
  const start = addDays(today, -today.getDay() - offset * 7);
  return fromDayKey(dayKey(start));
}

function scansBetween(scans: ScanResult[], from: string, to: string): ScanResult[] {
  return scans.filter((scan) => {
    const key = dayKey(scan.scannedAt);
    return key >= from && key <= to;
  });
}

// Nutrition tracking helpers (Phase 3)

/** Consecutive days with at least one logged food, ending today or yesterday. */
export function computeLogStreak(loggedDays: Set<string>, today: string): number {
  let cursor = loggedDays.has(today) ? today : dayKey(addDays(fromDayKey(today), -1));
  let streak = 0;
  while (loggedDays.has(cursor)) {
    streak += 1;
    cursor = dayKey(addDays(fromDayKey(cursor), -1));
    if (streak > 3650) break;
  }
  return streak;
}

export function longestLogStreak(loggedDays: Set<string>): number {
  const keys = [...loggedDays].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of keys) {
    run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

const loggedDaysOf = (scans: ScanResult[]): Set<string> =>
  new Set(scans.map((scan) => dayKey(scan.scannedAt)));

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

const RANGE_DAYS: Record<InsightsRange, number | null> = {
  '90d': 90,
  '6m': 182,
  '1y': 364,
  all: null,
};

export const mockInsightsService: InsightsService = {
  async homeSummary(profileId, date) {
    await simulate(0.4);
    const scans = await mockHistoryService.list(profileId);
    const days = summarise(scans);
    const day = days.get(date) ?? emptyDay(date);
    return {
      day,
      streak: computeStreak(days, dayKey(new Date())),
      safeRate: day.total ? day.safe / day.total : null,
      topFlagged: topFlaggedIngredient(scans),
      savedCount: scans.filter((scan) => scan.saved).length,
      totalScans: scans.length,
    };
  },

  async daySummaries(profileId, fromDate, toDate) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const days = summarise(scans);
    const count = Math.max(0, daysBetween(fromDate, toDate)) + 1;
    return Array.from({ length: count }, (_, index) => {
      const key = dayKey(addDays(fromDayKey(fromDate), index));
      return days.get(key) ?? emptyDay(key);
    });
  },

  async overview(profileId) {
    await simulate(0.5);
    const [scans, reactions] = await Promise.all([
      mockHistoryService.list(profileId),
      mockReactionService.list(profileId),
    ]);
    const days = summarise(scans);
    const today = dayKey(new Date());
    const sortedReactions = [...reactions].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    const last = sortedReactions[sortedReactions.length - 1] ?? null;
    const firstScan = [...scans].sort((a, b) => a.scannedAt.localeCompare(b.scannedAt))[0] ?? null;
    // Longest reaction-free run: gaps between reactions, plus the run since the last one.
    let longestRun = 0;
    const anchors = [
      firstScan?.scannedAt ?? null,
      ...sortedReactions.map((r) => r.occurredAt),
      null,
    ].filter((value): value is string | null => value !== undefined);
    for (let index = 0; index < anchors.length - 1; index += 1) {
      const start = anchors[index];
      const end = anchors[index + 1] ?? new Date().toISOString();
      if (!start) continue;
      longestRun = Math.max(longestRun, daysBetween(dayKey(start), dayKey(end)));
    }
    const flaggedScans = scans.filter(isFlagged).length;
    return {
      streak: computeStreak(days, today),
      longestStreak: longestStreak(days),
      totalScans: scans.length,
      flaggedScans,
      safeRate: scans.length
        ? scans.filter((s) => s.verdict.kind === 'safe').length / scans.length
        : null,
      daysWithScans: [...days.values()].filter((day) => day.total > 0).length,
      firstScanAt: firstScan?.scannedAt ?? null,
      badgesEarned: 0,
      daysSinceLastReaction: last ? daysBetween(dayKey(last.occurredAt), today) : null,
      longestReactionFreeRun: longestRun,
      lastReactionAt: last?.occurredAt ?? null,
    };
  },

  async flaggedSeries(profileId, range) {
    await simulate(0.4);
    const scans = await mockHistoryService.list(profileId);
    const today = fromDayKey(dayKey(new Date()));
    const spans: Record<InsightsRange, { days: number; bucket: number }> = {
      '90d': { days: 90, bucket: 1 },
      '6m': { days: 182, bucket: 7 },
      '1y': { days: 364, bucket: 7 },
      all: { days: 364 * 2, bucket: 14 },
    };
    const { days, bucket } = spans[range];
    const points: SeriesPoint[] = [];
    for (let offset = days - bucket; offset >= 0; offset -= bucket) {
      const start = addDays(today, -offset - (bucket - 1));
      const end = addDays(today, -offset);
      const inBucket = scansBetween(scans, dayKey(start), dayKey(end));
      points.push({
        date: dayKey(start),
        flagged: inBucket.filter(isFlagged).length,
        total: inBucket.length,
      });
    }
    return points;
  },

  async scanChanges(profileId) {
    await simulate(0.4);
    const scans = await mockHistoryService.list(profileId);
    const today = fromDayKey(dayKey(new Date()));
    const firstScan = [...scans].sort((a, b) => a.scannedAt.localeCompare(b.scannedAt))[0];
    const dataDays = firstScan ? daysBetween(dayKey(firstScan.scannedAt), dayKey(today)) + 1 : 0;
    return WINDOWS.map<ScanChangeRow>(({ key, days }) => {
      const span = days ?? Math.max(dataDays, 1);
      const from = dayKey(addDays(today, -(span - 1)));
      const to = dayKey(today);
      const current = scansBetween(scans, from, to);
      const previous =
        days === null
          ? null
          : scansBetween(
              scans,
              dayKey(addDays(today, -(2 * span - 1))),
              dayKey(addDays(today, -span)),
            );
      const buckets = Math.min(span, 7);
      const bucketSize = Math.max(1, Math.ceil(span / buckets));
      const series = Array.from({ length: buckets }, (_, index) => {
        const end = addDays(today, -(buckets - 1 - index) * bucketSize);
        const start = addDays(end, -(bucketSize - 1));
        return scansBetween(scans, dayKey(start), dayKey(end)).filter(isFlagged).length;
      });
      const ready = days === null ? scans.length > 0 : dataDays >= span && current.length > 0;
      const flagged = current.filter(isFlagged).length;
      const previousFlagged = previous ? previous.filter(isFlagged).length : null;
      const trend: ScanChangeRow['trend'] = !ready
        ? 'pending'
        : previousFlagged === null || previousFlagged === flagged
          ? 'same'
          : flagged < previousFlagged
            ? 'fewer'
            : 'more';
      return { window: key, flagged, previous: previousFlagged, trend, series, ready };
    });
  },

  async dailyScans(profileId, weekOffset) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const days = summarise(scans);
    const start = weekStartFor(fromDayKey(dayKey(new Date())), weekOffset);
    const week = Array.from({ length: 7 }, (_, index) => {
      const key = dayKey(addDays(start, index));
      return days.get(key) ?? emptyDay(key);
    });
    const total = week.reduce((sum, day) => sum + day.total, 0);
    const activeDays = week.filter((day) => day.total > 0).length;
    return {
      weekStart: dayKey(start),
      days: week,
      averagePerDay: activeDays ? Math.round((total / activeDays) * 10) / 10 : 0,
    };
  },

  async weeklyOverview(profileId, weekOffset) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const start = weekStartFor(fromDayKey(dayKey(new Date())), weekOffset);
    const days = Array.from({ length: 7 }, (_, index) => {
      const key = dayKey(addDays(start, index));
      const inDay = scansBetween(scans, key, key);
      return { date: key, checked: inDay.length, flagged: inDay.filter(isFlagged).length };
    });
    const checked = days.reduce((sum, day) => sum + day.checked, 0);
    const flagged = days.reduce((sum, day) => sum + day.flagged, 0);
    const safe = scansBetween(scans, dayKey(start), dayKey(addDays(start, 6))).filter(
      (scan) => scan.verdict.kind === 'safe',
    ).length;
    return {
      weekStart: dayKey(start),
      checked,
      flagged,
      safeRate: checked ? safe / checked : null,
      days,
    };
  },

  async topFlagged(profileId) {
    await simulate(0.3);
    const scans = await mockHistoryService.list(profileId);
    const daysWithScans = summarise(scans).size;
    return {
      unlocked: daysWithScans >= TOP_FLAGGED_REQUIRED_DAYS,
      daysWithScans,
      requiredDays: TOP_FLAGGED_REQUIRED_DAYS,
      items: rankFlagged(scans).slice(0, 6),
    };
  },

  // Nutrition tracking (Phase 3)

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
      if (!latest) return { window: key, changeLbs: null, trend: 'pending', series: [], ready: false };
      const from = days === null ? null : dayKey(addDays(fromDayKey(today), -(days - 1)));
      const inWindow = entries.filter((entry) => from === null || dayKey(entry.loggedAt) >= from);
      const before = from === null ? undefined : [...entries].reverse().find((entry) => dayKey(entry.loggedAt) < from);
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
      const eaten = sumNutrition(
        scans.filter((scan) => dayKey(scan.scannedAt) === key).map((scan) => scan.product.nutrition),
      );
      const macros = macroCalories(eaten);
      return { date: key, calories: eaten.calories, ...macros };
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
      const consumed = sumNutrition(
        scans.filter((scan) => dayKey(scan.scannedAt) === key).map((scan) => scan.product.nutrition),
      ).calories;
      return { date: key, burned: activityFor(profileId, key).caloriesBurned, consumed };
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
    return WINDOWS.filter((window) => window.days !== null).map<ExpenditureRow>(({ key, days }) => {
      const span = days ?? 1;
      if (!health.connected || dataDays < span) {
        return { window: key, burned: null, trend: 'pending', ready: false };
      }
      const burned = Array.from({ length: span }, (_, index) =>
        activityFor(profileId, dayKey(addDays(today, -index))).caloriesBurned,
      );
      const average = Math.round(burned.reduce((sum, value) => sum + value, 0) / span);
      return { window: key, burned: average, trend: 'same', ready: true };
    });
  },
};
