import { allWorkouts, waterDays } from './activityService';
import { mockHistoryService } from './historyService';
import { simulate } from './support';
import { listWeights } from './weightService';
import type { BadgeService } from '../types';
import { dayHealthScore, ringStatus, sumNutrition } from '@/features/tracking/nutrition';
import { goalsOf } from '@/features/tracking/profile';
import { longestLogStreak } from '@/features/tracking/streaks';
import { useProfileStore } from '@/store/profileStore';
import type { Badge, BadgeGroup, ScanResult } from '@/types';
import { addDays, dayKey, daysBetween, fromDayKey } from '@/utils/date';

interface Context {
  scans: ScanResult[];
  /** Scans grouped by local day, oldest day first. */
  days: Map<string, ScanResult[]>;
  longestStreak: number;
  goalDays: string[];
  waterDays: string[];
  workouts: number;
  weights: number;
  invites: number;
}

interface BadgeRule {
  id: string;
  icon: string;
  group: BadgeGroup;
  target: number;
  /** Current progress and, once the target is reached, when it happened. */
  measure: (ctx: Context) => { current: number; reachedAt: string | null };
}

const nthScan = (scans: ScanResult[], n: number): string | null =>
  scans[n - 1]?.scannedAt ?? null;

/** Longest run of consecutive day keys. */
function longestRun(keys: string[]): number {
  const sorted = [...new Set(keys)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of sorted) {
    run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

const streakBadge = (id: string, icon: string, target: number): BadgeRule => ({
  id,
  icon,
  group: 'streak',
  target,
  measure: (ctx) => ({
    current: ctx.longestStreak,
    reachedAt: ctx.longestStreak >= target ? new Date().toISOString() : null,
  }),
});

const mealsBadge = (id: string, icon: string, target: number): BadgeRule => ({
  id,
  icon,
  group: 'meals',
  target,
  measure: (ctx) => ({
    current: ctx.scans.length,
    reachedAt: ctx.scans.length >= target ? nthScan(ctx.scans, target) : null,
  }),
});

const goalRunBadge = (id: string, icon: string, target: number): BadgeRule => ({
  id,
  icon,
  group: 'goals',
  target,
  measure: (ctx) => {
    const run = target === 1 ? ctx.goalDays.length : longestRun(ctx.goalDays);
    return { current: run, reachedAt: run >= target ? new Date().toISOString() : null };
  },
});

const inviteBadge = (id: string, icon: string, target: number): BadgeRule => ({
  id,
  icon,
  group: 'friends',
  target,
  measure: (ctx) => ({ current: ctx.invites, reachedAt: null }),
});

const waterBadge = (id: string, icon: string, target: number): BadgeRule => ({
  id,
  icon,
  group: 'water',
  target,
  measure: (ctx) => {
    const run = target === 1 ? ctx.waterDays.length : longestRun(ctx.waterDays);
    return { current: run, reachedAt: run >= target ? new Date().toISOString() : null };
  },
});

/** Days in the last 7 with at least one food whose ingredients match the pattern. */
const foodDaysBadge = (id: string, icon: string, target: number, pattern: RegExp): BadgeRule => ({
  id,
  icon,
  group: 'food',
  target,
  measure: (ctx) => {
    const from = dayKey(addDays(fromDayKey(dayKey(new Date())), -6));
    const matched = new Set<string>();
    for (const scan of ctx.scans) {
      const key = dayKey(scan.scannedAt);
      if (key < from) continue;
      const text = `${scan.product.name} ${scan.product.ingredientsText} ${scan.product.allergenStatement ?? ''}`;
      if (pattern.test(text)) matched.add(key);
    }
    return {
      current: matched.size,
      reachedAt: matched.size >= target ? new Date().toISOString() : null,
    };
  },
});

/** The 30 milestones, in the order the grid shows them. */
export const BADGE_RULES: BadgeRule[] = [
  streakBadge('rookie', 'flame', 3),
  streakBadge('getting_serious', 'flame', 10),
  streakBadge('locked_in', 'lock', 50),
  streakBadge('triple_threat', 'flame', 100),
  streakBadge('no_days_off', 'calendar', 365),
  streakBadge('immortal', 'starFour', 1000),
  mealsBadge('forking_around', 'restaurant', 5),
  mealsBadge('mission_nutrition', 'bowl', 50),
  mealsBadge('the_logfather', 'crown', 500),
  goalRunBadge('one_hit_wonder', 'target2', 1),
  goalRunBadge('loyalty_iii', 'seven', 7),
  goalRunBadge('bullseye', 'target', 30),
  inviteBadge('helping_hand', 'hand', 1),
  inviteBadge('peer_pressurer', 'people', 3),
  inviteBadge('cult_leader', 'trophy', 10),
  waterBadge('hydrated', 'cup', 1),
  waterBadge('sippin', 'drop', 3),
  waterBadge('aquaholic', 'cup', 10),
  {
    id: 'clean_sweep',
    icon: 'broom',
    group: 'habits',
    target: 3,
    measure: (ctx) => {
      let best = 0;
      let reachedAt: string | null = null;
      for (const scans of ctx.days.values()) {
        best = Math.max(best, scans.length);
        if (scans.length >= 3 && !reachedAt) reachedAt = scans[2]?.scannedAt ?? null;
      }
      return { current: best, reachedAt };
    },
  },
  {
    id: 'sweat_equity',
    icon: 'dumbbell',
    group: 'habits',
    target: 5,
    measure: (ctx) => ({
      current: ctx.workouts,
      reachedAt: ctx.workouts >= 5 ? new Date().toISOString() : null,
    }),
  },
  {
    id: 'speed_logger',
    icon: 'speed',
    group: 'habits',
    target: 10,
    measure: (ctx) => {
      const saved = ctx.scans.filter((scan) => scan.saved);
      return { current: saved.length, reachedAt: saved.length >= 10 ? nthScan(saved, 10) : null };
    },
  },
  foodDaysBadge('green_machine', 'leaf', 5, /spinach|kale|lettuce|greens|broccoli|salad/i),
  foodDaysBadge('nut_case', 'peanut', 4, /almond|peanut|cashew|walnut|hazelnut|pistachio|tree nut/i),
  foodDaysBadge('berry_suspicious', 'berry', 3, /berr/i),
  {
    id: 'time_traveler',
    icon: 'clockOld',
    group: 'special',
    target: 1,
    // Logging for a past day is not tracked by the mock services yet.
    measure: () => ({ current: 0, reachedAt: null }),
  },
  {
    id: 'gremlin',
    icon: 'ghost',
    group: 'special',
    target: 1,
    measure: (ctx) => {
      const late = ctx.scans.filter((scan) => new Date(scan.scannedAt).getHours() < 4);
      return { current: late.length ? 1 : 0, reachedAt: late[0]?.scannedAt ?? null };
    },
  },
  {
    id: 'health_nut',
    icon: 'sparkles',
    group: 'special',
    target: 1,
    measure: (ctx) => scoreDay(ctx, 10),
  },
  {
    id: 'dumpster_diver',
    icon: 'trashBin',
    group: 'special',
    target: 1,
    measure: (ctx) => scoreDay(ctx, 1),
  },
  {
    id: 'doppelganger',
    icon: 'twins',
    group: 'special',
    target: 1,
    measure: (ctx) => {
      const seen = new Map<string, string>();
      for (const [day, scans] of ctx.days) {
        const signature = scans
          .map((scan) => scan.product.id)
          .sort()
          .join('|');
        if (!signature) continue;
        if (seen.has(signature)) return { current: 1, reachedAt: `${day}T12:00:00.000Z` };
        seen.set(signature, day);
      }
      return { current: 0, reachedAt: null };
    },
  },
  {
    id: 'the_omega_log',
    icon: 'omega',
    group: 'special',
    target: 4,
    measure: (ctx) => {
      const parts = [
        ctx.scans.length > 0,
        ctx.waterDays.length > 0,
        ctx.workouts > 0,
        ctx.weights > 0,
      ].filter(Boolean).length;
      return { current: parts, reachedAt: parts >= 4 ? new Date().toISOString() : null };
    },
  },
];

function scoreDay(ctx: Context, wanted: number): { current: number; reachedAt: string | null } {
  for (const [day, scans] of ctx.days) {
    const score = dayHealthScore(scans.map((scan) => scan.product.healthScore));
    if (score === wanted) return { current: 1, reachedAt: `${day}T12:00:00.000Z` };
  }
  return { current: 0, reachedAt: null };
}

function groupByDay(scans: ScanResult[]): Map<string, ScanResult[]> {
  const days = new Map<string, ScanResult[]>();
  for (const scan of scans) {
    const key = dayKey(scan.scannedAt);
    days.set(key, [...(days.get(key) ?? []), scan]);
  }
  return new Map([...days.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export const mockBadgeService: BadgeService = {
  async list(profileId) {
    await simulate(0.3);
    const history = await mockHistoryService.list(profileId);
    const scans = [...history].sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));
    const days = groupByDay(scans);
    const profile = useProfileStore.getState().profiles.find((p) => p.id === profileId) ?? null;
    const goals = goalsOf(profile);
    const goalDays = [...days.entries()]
      .filter(([, inDay]) => {
        const eaten = sumNutrition(inDay.map((scan) => scan.product.nutrition));
        return ringStatus(eaten.calories, goals.calories, inDay.length) === 'green';
      })
      .map(([day]) => day);
    const ctx: Context = {
      scans,
      days,
      longestStreak: longestLogStreak(new Set(days.keys())),
      goalDays,
      waterDays: waterDays(profileId),
      workouts: allWorkouts(profileId).length,
      weights: listWeights(profileId).length,
      invites: 0,
    };
    return BADGE_RULES.map<Badge>((rule) => {
      const { current, reachedAt } = rule.measure(ctx);
      return {
        id: rule.id,
        icon: rule.icon,
        group: rule.group,
        current: Math.min(current, rule.target),
        target: rule.target,
        earnedAt: current >= rule.target ? (reachedAt ?? new Date().toISOString()) : null,
      };
    });
  },
};
