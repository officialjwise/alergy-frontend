import { useMemo } from 'react';

import { useHistory } from '@/features/history/useHistory';
import { dayKey } from '@/utils/date';

/**
 * Foods for the "Recently uploaded" list. Today shows the latest logs overall;
 * any other selected day shows only that day's logs.
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
