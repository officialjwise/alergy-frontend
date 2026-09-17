import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';
import type { NewPostInput, Post, PostFilter, PostReportReason } from '@/types';

const keep = <T>(previous: T | undefined) => previous;

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.list,
    queryFn: () => getServices().groups.list(),
    placeholderData: keep,
  });
}

export function useGroup(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.detail(id ?? 'none'),
    queryFn: () => getServices().groups.get(id ?? ''),
    enabled: !!id,
  });
}

export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.members(groupId ?? 'none'),
    queryFn: () => getServices().groups.members(groupId ?? ''),
    enabled: !!groupId,
    placeholderData: keep,
  });
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.member(id ?? 'none'),
    queryFn: () => getServices().groups.member(id ?? ''),
    enabled: !!id,
  });
}

export function usePosts(groupId: string | undefined, filter: PostFilter) {
  return useQuery({
    queryKey: queryKeys.groups.posts(groupId ?? 'none', filter),
    queryFn: () => getServices().groups.posts(groupId ?? '', filter),
    enabled: !!groupId,
    placeholderData: keep,
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.post(id ?? 'none'),
    queryFn: () => getServices().groups.post(id ?? ''),
    enabled: !!id,
  });
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.comments(postId ?? 'none'),
    queryFn: () => getServices().groups.comments(postId ?? ''),
    enabled: !!postId,
    placeholderData: keep,
  });
}

export function useInvite(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groups.invite(groupId ?? 'none'),
    queryFn: () => getServices().groups.invite(groupId ?? ''),
    enabled: !!groupId,
  });
}

function useInvalidateGroups() {
  const client = useQueryClient();
  return () => void client.invalidateQueries({ queryKey: queryKeys.groups.all });
}

export function useJoinGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: async ({ id, join }: { id: string; join: boolean }): Promise<void> => {
      if (join) await getServices().groups.join(id);
      else await getServices().groups.leave(id);
    },
    onSuccess: invalidate,
  });
}

export function useCreateGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; imageUri?: string }) =>
      getServices().groups.create(input),
    onSuccess: invalidate,
  });
}

export function useCreatePost() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (input: NewPostInput) => getServices().groups.createPost(input),
    onSuccess: invalidate,
  });
}

export function useReact() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, emoji }: { postId: string; emoji: string }) =>
      getServices().groups.react(postId, emoji),
    onSuccess: (post: Post) => {
      client.setQueryData(queryKeys.groups.post(post.id), post);
      void client.invalidateQueries({ queryKey: ['groups', 'posts'] });
    },
  });
}

export function useAddComment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      getServices().groups.addComment(postId, text),
    onSuccess: (_comment, { postId }) => {
      void client.invalidateQueries({ queryKey: queryKeys.groups.comments(postId) });
      void client.invalidateQueries({ queryKey: queryKeys.groups.post(postId) });
      void client.invalidateQueries({ queryKey: ['groups', 'posts'] });
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({
      postId,
      reason,
      notes,
    }: {
      postId: string;
      reason: PostReportReason;
      notes?: string;
    }) => getServices().groups.reportPost(postId, reason, notes),
  });
}

export function useBlockMember() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (memberId: string) => getServices().groups.blockMember(memberId),
    onSuccess: invalidate,
  });
}
