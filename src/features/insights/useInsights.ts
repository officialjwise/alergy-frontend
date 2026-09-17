import { useQuery } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import type { InsightsRange } from '@/types';

const placeholder = <T>(previous: T | undefined) => previous;

export function useInsightsOverview(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.overview(profileId ?? 'none'),
    queryFn: () => getServices().insights.overview(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}

export function useFlaggedSeries(profileId: string | null, range: InsightsRange) {
  return useQuery({
    queryKey: queryKeys.insights.series(profileId ?? 'none', range),
    queryFn: () => getServices().insights.flaggedSeries(profileId ?? '', range),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}

export function useScanChanges(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.changes(profileId ?? 'none'),
    queryFn: () => getServices().insights.scanChanges(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}

export function useDailyScans(profileId: string | null, weekOffset: number) {
  return useQuery({
    queryKey: queryKeys.insights.daily(profileId ?? 'none', weekOffset),
    queryFn: () => getServices().insights.dailyScans(profileId ?? '', weekOffset),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}

export function useWeeklyOverview(profileId: string | null, weekOffset: number) {
  return useQuery({
    queryKey: queryKeys.insights.weekly(profileId ?? 'none', weekOffset),
    queryFn: () => getServices().insights.weeklyOverview(profileId ?? '', weekOffset),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}

export function useTopFlagged(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.insights.topFlagged(profileId ?? 'none'),
    queryFn: () => getServices().insights.topFlagged(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: placeholder,
  });
}
