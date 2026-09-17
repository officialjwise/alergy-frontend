import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import type { Reaction, ReactionInput } from '@/types';

export function useReactions(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.reactions.list(profileId ?? 'none'),
    queryFn: () => getServices().reactions.list(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useReaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reactions.detail(id ?? 'none'),
    queryFn: () => getServices().reactions.get(id ?? ''),
    enabled: !!id,
  });
}

function useInvalidateReactions() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.reactions.all });
    void client.invalidateQueries({ queryKey: queryKeys.insights.all });
    void client.invalidateQueries({ queryKey: queryKeys.badges.all });
  };
}

export function useAddReaction() {
  const client = useQueryClient();
  const invalidate = useInvalidateReactions();
  return useMutation({
    mutationFn: (input: ReactionInput) => getServices().reactions.add(input),
    onSuccess: (reaction: Reaction) => {
      client.setQueryData(queryKeys.reactions.detail(reaction.id), reaction);
      invalidate();
    },
  });
}

export function useRemoveReaction() {
  const invalidate = useInvalidateReactions();
  return useMutation({
    mutationFn: (id: string) => getServices().reactions.remove(id),
    onSuccess: invalidate,
  });
}

export function useRestoreReaction() {
  const invalidate = useInvalidateReactions();
  return useMutation({
    mutationFn: (reaction: Reaction) => {
      const { id: _id, createdAt: _createdAt, ...input } = reaction;
      return getServices().reactions.add(input);
    },
    onSuccess: invalidate,
  });
}
