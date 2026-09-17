import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * Single MMKV instance for the app. Everything that must survive a relaunch
 * (onboarding progress, language, profiles, session) goes through here.
 */
export const storage = createMMKV({ id: 'allergy-app' });

/** Adapter so zustand's `persist` middleware can write to MMKV synchronously. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

export const storageKeys = {
  onboarding: 'onboarding-v1',
  profiles: 'profiles-v1',
  app: 'app-v1',
  history: 'history-v1',
  reactions: 'reactions-v1',
  actionPlan: 'action-plan-v1',
  groups: 'groups-v1',
  notifications: 'notifications-v1',
  weights: 'weights-v1',
  workouts: 'workouts-v1',
  water: 'water-v1',
  health: 'health-v1',
} as const;

export function clearAllStorage(): void {
  storage.clearAll();
}
