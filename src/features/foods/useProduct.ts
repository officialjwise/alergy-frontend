import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { evaluateProduct, getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import type { Product, ScanResult } from '@/types';
import { createId } from '@/utils/id';

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? 'none'),
    queryFn: () => getServices().scan.getProduct(id ?? ''),
    enabled: !!id,
  });
}

/**
 * Saving a catalogue product that was never scanned creates a scan record for
 * it (source "manual") so it shows up in saved foods and history like any scan.
 */
export function useSaveProduct() {
  const client = useQueryClient();
  const profile = useProfileStore(selectActiveProfile);
  return useMutation({
    mutationFn: async (product: Product): Promise<ScanResult> => {
      if (!profile) throw new Error('No active profile');
      const scan: ScanResult = {
        id: createId('scan'),
        profileId: profile.id,
        product,
        verdict: evaluateProduct(product, profile),
        source: 'manual',
        scannedAt: new Date().toISOString(),
        saved: true,
      };
      return getServices().history.add(scan);
    },
    onSuccess: (scan) => {
      client.setQueryData(queryKeys.history.detail(scan.id), scan);
      void client.invalidateQueries({ queryKey: queryKeys.history.all });
      void client.invalidateQueries({ queryKey: queryKeys.insights.all });
    },
  });
}
