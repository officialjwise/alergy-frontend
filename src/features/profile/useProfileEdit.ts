import { useCallback } from 'react';

import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import type { UserProfile } from '@/types';

/** Edits the active profile in the store (mirrored by ProfileService later). */
export function useActiveProfileEdit() {
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const update = useCallback(
    (patch: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => {
      if (profile) updateProfile(profile.id, patch);
    },
    [profile, updateProfile],
  );
  return { profile, update };
}
