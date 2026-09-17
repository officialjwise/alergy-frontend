import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { getServices } from '@/services';
import { queryKeys } from '@/services/queryClient';

export function useActionPlan(profileId: string | null) {
  return useQuery({
    queryKey: queryKeys.actionPlan.list(profileId ?? 'none'),
    queryFn: () => getServices().actionPlan.list(profileId ?? ''),
    enabled: !!profileId,
    placeholderData: (previous) => previous,
  });
}

export function useAddActionPlanPhoto(profileId: string | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => getServices().actionPlan.add(profileId ?? '', uri),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.actionPlan.all }),
  });
}

export function useRemoveActionPlanPhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getServices().actionPlan.remove(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.actionPlan.all }),
  });
}

/** Opens the photo library; resolves with the chosen uri, null when cancelled, 'denied' without access. */
export async function pickDocumentPhoto(): Promise<string | null | 'denied'> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return 'denied';
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return null;
  return asset.uri;
}
