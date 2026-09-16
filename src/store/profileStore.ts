import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import type { UserProfile } from '@/types';

export interface ProfileState {
  profiles: UserProfile[];
  activeProfileId: string | null;
  addProfile: (profile: UserProfile, makeActive?: boolean) => void;
  updateProfile: (id: string, patch: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      activeProfileId: null,
      addProfile: (profile, makeActive = true) =>
        set((state) => ({
          profiles: [...state.profiles.filter((p) => p.id !== profile.id), profile],
          activeProfileId:
            makeActive || !state.activeProfileId ? profile.id : state.activeProfileId,
        })),
      updateProfile: (id, patch) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),
      removeProfile: (id) =>
        set((state) => {
          const profiles = state.profiles.filter((p) => p.id !== id);
          const activeProfileId =
            state.activeProfileId === id ? (profiles[0]?.id ?? null) : state.activeProfileId;
          return { profiles, activeProfileId };
        }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      clear: () => set({ profiles: [], activeProfileId: null }),
    }),
    {
      name: storageKeys.profiles,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 1,
    },
  ),
);

export const selectActiveProfile = (state: ProfileState): UserProfile | null =>
  state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0] ?? null;
