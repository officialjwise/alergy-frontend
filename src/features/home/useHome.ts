import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHistory } from '@/features/history/useHistory';
import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import { dayKey } from '@/utils/date';

/** Dashboard numbers for one day. */
export function useHomeSummary(profileId: string | null, date: string) {
  return useQuery({
    queryKey: queryKeys.insights.home(profileId ?? 'none', date),
    queryFn: () => getServices().insights.homeSummary(profileId ?? '', date),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

/** One summary per day in a range (used by the week strip). */
export function useDaySummaries(profileId: string | null, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: queryKeys.insights.days(profileId ?? 'none', fromDate, toDate),
    queryFn: () => getServices().insights.daySummaries(profileId ?? '', fromDate, toDate),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

/**
 * Scans for the "Recently scanned" list. Today shows the latest scans overall;
 * any other selected day shows only that day's scans.
 */
export function useRecentScans(profileId: string | null, date: string, limit = 5) {
  const history = useHistory(profileId);
  const today = dayKey(new Date());
  const items = useMemo(() => {
    const all = history.data ?? [];
    const scoped = date === today ? all : all.filter((scan) => dayKey(scan.scannedAt) === date);
    return scoped.slice(0, limit);
  }, [date, history.data, limit, today]);
  return { ...history, items };
}
