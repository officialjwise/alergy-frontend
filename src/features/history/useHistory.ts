import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import type { ScanPatch } from '@/services/types';
import type { HistoryFilter, ScanResult } from '@/types';

const filterKey = (filter?: HistoryFilter): string =>
  JSON.stringify({
    q: filter?.query ?? '',
    v: filter?.verdict ?? 'all',
    s: filter?.savedOnly ?? false,
  });

export function useHistory(profileId: string | null, filter?: HistoryFilter) {
  return useQuery({
    queryKey: queryKeys.history.list(profileId ?? 'none', filterKey(filter)),
    queryFn: () => getServices().history.list(profileId ?? '', filter),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useScan(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.history.detail(id ?? 'none'),
    queryFn: () => getServices().history.get(id ?? ''),
    enabled: !!id,
  });
}

export function useToggleSaved() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      getServices().history.setSaved(id, saved),
    onSuccess: (result: ScanResult) => {
      client.setQueryData(queryKeys.history.detail(result.id), result);
      void client.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}

/** Applies "Fix results" edits (product and re-evaluated verdict) to a scan. */
export function useUpdateScan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ScanPatch }) =>
      getServices().history.update(id, patch),
    onSuccess: (result: ScanResult) => {
      client.setQueryData(queryKeys.history.detail(result.id), result);
      void client.invalidateQueries({ queryKey: queryKeys.history.all });
      void client.invalidateQueries({ queryKey: queryKeys.insights.all });
    },
  });
}

export function useRemoveScan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getServices().history.remove(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.history.all }),
  });
}

/** Puts a deleted scan back (undo after a swipe delete). */
export function useRestoreScan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (scan: ScanResult) => getServices().history.add(scan),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.history.all });
      void client.invalidateQueries({ queryKey: queryKeys.insights.all });
    },
  });
}
