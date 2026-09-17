import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getServices, type AnalyzeInput } from '@/services';
import { queryKeys } from '@/services/queryClient';
import { useProfileStore, selectActiveProfile } from '@/store/profileStore';
import type { ReportProblemInput, ScanResult } from '@/types';

/** Runs a scan against the active profile and stores it in the history. */
export function useAnalyze() {
  const client = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  return useMutation({
    mutationFn: async (input: Omit<AnalyzeInput, 'profile'>): Promise<ScanResult> => {
      if (!profile) throw new Error('No active profile');
      const services = getServices();
      const result = await services.scan.analyze({ ...input, profile });
      await services.history.add(result);
      client.setQueryData(queryKeys.history.detail(result.id), result);
      return result;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.history.all }),
  });
}

export function useProductSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.products.search(trimmed),
    queryFn: () => getServices().scan.searchProducts(trimmed),
    enabled: trimmed.length >= 2,
    placeholderData: (previous) => previous,
  });
}

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (barcode: string) => getServices().scan.lookupBarcode(barcode),
  });
}

export function useReportProblem() {
  return useMutation({
    mutationFn: (input: ReportProblemInput) => getServices().scan.report(input),
  });
}
