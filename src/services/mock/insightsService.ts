import { mockHistoryService } from './historyService';
import { simulate } from './support';
import type { InsightsService } from '../types';
import type { DaySummary, FlaggedIngredientCount, ScanResult } from '@/types';
import { addDays, dayKey, daysBetween, fromDayKey } from '@/utils/date';

/** Everything on the dashboard is derived from the scan history, so it stays consistent with it. */

function emptyDay(date: string): DaySummary {
  return { date, total: 0, safe: 0, caution: 0, unsafe: 0, unknown: 0 };
}

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

export function topFlaggedIngredient(scans: ScanResult[]): FlaggedIngredientCount | null {
  const counts = new Map<string, FlaggedIngredientCount>();
  for (const scan of scans) {
    for (const trigger of scan.verdict.triggers) {
      const current = counts.get(trigger.ingredientId) ?? {
        ingredientId: trigger.ingredientId,
        name: trigger.ingredientName,
        count: 0,
      };
      current.count += 1;
      counts.set(trigger.ingredientId, current);
    }
  }
  let top: FlaggedIngredientCount | null = null;
  for (const entry of counts.values()) if (!top || entry.count > top.count) top = entry;
  return top;
}

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
};
