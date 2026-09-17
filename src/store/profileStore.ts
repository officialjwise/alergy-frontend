import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import type { AvoidedFood, UserProfile, WorstReaction } from '@/types';

/** Shape of a profile persisted before the questionnaire (version 1). */
interface LegacyProfile {
  id: string;
  name: string;
  profileFor: string;
  birthDate: UserProfile['birthDate'];
  restrictions?: { ingredientId: string; name: string; severity: string }[];
  customIngredients?: Record<string, { id: string; name: string }>;
  color: string;
  createdAt: string;
  updatedAt: string;
  body?: UserProfile['body'];
  nutritionGoals?: UserProfile['nutritionGoals'];
}

const LEGACY_WORST: Record<string, WorstReaction> = {
  mild: 'mild',
  moderate: 'treatment',
  severe: 'severe',
  anaphylaxis: 'severe',
};

/** Profiles created with the old survey keep working; they are invited to answer the questionnaire. */
export function migrateLegacyProfile(legacy: LegacyProfile): UserProfile {
  const foods: AvoidedFood[] = (legacy.restrictions ?? []).map((item) => {
    const custom = legacy.customIngredients?.[item.ingredientId];
    const worst = LEGACY_WORST[item.severity] ?? 'unsure';
    return {
      id: item.ingredientId,
      name: item.name,
      allergenId: custom ? null : item.ingredientId,
      byNameOnly: !!custom,
      kind: 'allergy',
      kindAssumed: false,
      worst,
      severityAssumed: worst === 'unsure',
      strictness: null,
      doctorConfirmed: null,
      level: worst === 'mild' ? 'warning' : 'high',
      addedAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    };
  });
  return {
    id: legacy.id,
    name: legacy.name,
    profileFor: legacy.profileFor === 'myself' ? 'myself' : 'other',
    isAccountHolder: legacy.profileFor === 'myself',
    birthDate: legacy.birthDate ?? null,
    hasAllergies: foods.length ? 'yes' : 'no',
    foods,
    conditions: [],
    note: '',
    questionnaireVersion: 1,
    answers: null,
    emergencyContact: null,
    doctor: '',
    reactionFreeGoalDays: 30,
    color: legacy.color,
    body: legacy.body,
    nutritionGoals: legacy.nutritionGoals,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

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
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { profiles?: unknown[]; activeProfileId?: string | null };
        if (version < 2) {
          return {
            ...state,
            profiles: (state.profiles ?? []).map((profile) =>
              migrateLegacyProfile(profile as LegacyProfile),
            ),
          } as ProfileState;
        }
        return persisted as ProfileState;
      },
    },
  ),
);

export const selectActiveProfile = (state: ProfileState): UserProfile | null =>
  state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0] ?? null;
