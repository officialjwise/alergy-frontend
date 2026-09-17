import { useQuery } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';

export function useBadges(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.badges.list(profileId ?? 'none'),
    queryFn: () => getServices().badges.list(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}
