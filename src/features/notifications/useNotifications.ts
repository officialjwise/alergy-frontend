import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => getServices().notifications.list(),
    placeholderData: (previous) => previous,
  });
}

export function useMarkRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getServices().notifications.markRead(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => getServices().notifications.markAllRead(),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
