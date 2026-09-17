import { mockHistoryService } from './historyService';
import { longestStreak } from './insightsService';
import { mockReactionService } from './reactionService';
import { simulate } from './support';
import type { BadgeService } from '../types';
import { useProfileStore } from '@/store/profileStore';
import type { Badge, DaySummary, ScanResult } from '@/types';
import { dayKey } from '@/utils/date';

interface BadgeRule {
  id: string;
  icon: string;
  target: number;
  /** Returns the current count and, when reached, the date it was reached. */
  measure: (ctx: Context) => { current: number; reachedAt: string | null };
}

interface Context {
  scans: ScanResult[];
  reactionsCount: number;
  profilesCount: number;
  longest: number;
}

const nth = (scans: ScanResult[], n: number): string | null => scans[n - 1]?.scannedAt ?? null;
const countBadge = (
  id: string,
  icon: string,
  target: number,
  pick: (ctx: Context) => ScanResult[],
): BadgeRule => ({
  id,
  icon,
  target,
  measure: (ctx) => {
    const list = pick(ctx);
    return { current: list.length, reachedAt: list.length >= target ? nth(list, target) : null };
  },
});

/** Badge rules, all computed from activity so nothing needs to be stored. */
export const BADGE_RULES: BadgeRule[] = [
  countBadge('first_scan', 'scan', 1, (ctx) => ctx.scans),
  countBadge('ten_scans', 'scan', 10, (ctx) => ctx.scans),
  countBadge('fifty_scans', 'medal', 50, (ctx) => ctx.scans),
  countBadge('first_saved', 'bookmark', 1, (ctx) => ctx.scans.filter((s) => s.saved)),
  countBadge('five_saved', 'bookmark', 5, (ctx) => ctx.scans.filter((s) => s.saved)),
  countBadge('label_reader', 'document', 5, (ctx) =>
    ctx.scans.filter((s) => s.mode === 'label' || s.mode === 'menu'),
  ),
  countBadge('barcode_pro', 'barcode', 5, (ctx) => ctx.scans.filter((s) => s.source === 'barcode')),
  {
    id: 'explorer',
    icon: 'globe',
    target: 10,
    measure: (ctx) => {
      const seen = new Set<string>();
      let reachedAt: string | null = null;
      for (const scan of ctx.scans) {
        seen.add(scan.product.id);
        if (seen.size === 10 && !reachedAt) reachedAt = scan.scannedAt;
      }
      return { current: seen.size, reachedAt };
    },
  },
  {
    id: 'streak_7',
    icon: 'shieldCheck',
    target: 7,
    measure: (ctx) => ({
      current: ctx.longest,
      reachedAt: ctx.longest >= 7 ? new Date().toISOString() : null,
    }),
  },
  {
    id: 'streak_30',
    icon: 'shieldCheck',
    target: 30,
    measure: (ctx) => ({
      current: ctx.longest,
      reachedAt: ctx.longest >= 30 ? new Date().toISOString() : null,
    }),
  },
  {
    id: 'family',
    icon: 'people',
    target: 2,
    measure: (ctx) => ({
      current: ctx.profilesCount,
      reachedAt: ctx.profilesCount >= 2 ? new Date().toISOString() : null,
    }),
  },
  {
    id: 'reaction_logger',
    icon: 'reaction',
    target: 1,
    measure: (ctx) => ({
      current: ctx.reactionsCount,
      reachedAt: ctx.reactionsCount >= 1 ? new Date().toISOString() : null,
    }),
  },
];

function summarise(scans: ScanResult[]): Map<string, DaySummary> {
  const days = new Map<string, DaySummary>();
  for (const scan of scans) {
    const key = dayKey(scan.scannedAt);
    const day = days.get(key) ?? {
      date: key,
      total: 0,
      safe: 0,
      caution: 0,
      unsafe: 0,
      unknown: 0,
    };
    day.total += 1;
    day[scan.verdict.kind] += 1;
    days.set(key, day);
  }
  return days;
}

export const mockBadgeService: BadgeService = {
  async list(profileId) {
    await simulate(0.3);
    const [history, reactions] = await Promise.all([
      mockHistoryService.list(profileId),
      mockReactionService.list(profileId),
    ]);
    const scans = [...history].sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));
    const ctx: Context = {
      scans,
      reactionsCount: reactions.length,
      profilesCount: useProfileStore.getState().profiles.length,
      longest: longestStreak(summarise(scans)),
    };
    return BADGE_RULES.map<Badge>((rule) => {
      const { current, reachedAt } = rule.measure(ctx);
      return {
        id: rule.id,
        icon: rule.icon,
        current: Math.min(current, rule.target),
        target: rule.target,
        earnedAt: current >= rule.target ? reachedAt : null,
      };
    });
  },
};
