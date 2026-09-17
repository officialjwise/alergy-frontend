import { addDays, dayKey, daysBetween, fromDayKey } from '@/utils/date';

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

/** Longest run of consecutive logged days anywhere in the history. */
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
