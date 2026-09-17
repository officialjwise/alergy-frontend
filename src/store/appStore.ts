import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import type { AuthSession, LanguageCode, ScanMode } from '@/types';

export interface AccountInfo {
  name: string;
  username: string;
  plan: 'free' | 'premium';
  lastSyncedAt: string | null;
}

export interface Preferences {
  haptics: boolean;
  appearance: 'system' | 'light' | 'dark';
  defaultScanMode: ScanMode;
  /** Full-screen animation when a badge is unlocked. */
  badgeCelebrations: boolean;
  /** Calories and macros on the lock screen and Dynamic Island. */
  liveActivity: boolean;
  /** Burned calories are added back to the daily goal. */
  addBurnedCalories: boolean;
  /** Up to 200 calories left over yesterday roll into today. */
  rolloverCalories: boolean;
  /** Editing one goal re-balances the others proportionally. */
  autoAdjustMacros: boolean;
}

export type MealReminderKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'endOfDay';

export interface MealReminder {
  enabled: boolean;
  hour: number;
  minute: number;
}

export type MealReminders = Record<MealReminderKey, MealReminder>;

export const DEFAULT_MEAL_REMINDERS: MealReminders = {
  breakfast: { enabled: true, hour: 8, minute: 0 },
  lunch: { enabled: true, hour: 12, minute: 30 },
  snack: { enabled: false, hour: 16, minute: 0 },
  dinner: { enabled: true, hour: 19, minute: 0 },
  endOfDay: { enabled: false, hour: 21, minute: 30 },
};

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  /** 0 = Sunday. */
  days: number[];
}

export interface NotificationPrefs {
  productAlerts: boolean;
  groupActivity: boolean;
  replies: boolean;
  reminders: boolean;
}

export interface AppState {
  language: LanguageCode | null;
  session: AuthSession | null;
  notificationsEnabled: boolean;
  notificationsPrompted: boolean;
  marketingOptIn: boolean;
  acceptedTermsAt: string | null;
  /** The "Add workouts to your daily budget" sheet was shown once. */
  workoutsIntroShown: boolean;
  setWorkoutsIntroShown: () => void;
  account: AccountInfo;
  setAccount: (patch: Partial<AccountInfo>) => void;
  preferences: Preferences;
  setPreferences: (patch: Partial<Preferences>) => void;
  reminders: ReminderSettings;
  setReminders: (patch: Partial<ReminderSettings>) => void;
  mealReminders: MealReminders;
  setMealReminder: (key: MealReminderKey, patch: Partial<MealReminder>) => void;
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  setLanguage: (language: LanguageCode) => void;
  setSession: (session: AuthSession | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationsPrompted: () => void;
  setMarketingOptIn: (value: boolean) => void;
  acceptTerms: () => void;
  clear: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: null,
      session: null,
      notificationsEnabled: false,
      notificationsPrompted: false,
      marketingOptIn: true,
      acceptedTermsAt: null,
      workoutsIntroShown: false,
      setWorkoutsIntroShown: () => set({ workoutsIntroShown: true }),
      account: { name: '', username: '', plan: 'free', lastSyncedAt: null },
      setAccount: (patch) => set((state) => ({ account: { ...state.account, ...patch } })),
      preferences: {
        haptics: true,
        appearance: 'light',
        defaultScanMode: 'food',
        badgeCelebrations: true,
        liveActivity: false,
        addBurnedCalories: true,
        rolloverCalories: true,
        autoAdjustMacros: true,
      },
      setPreferences: (patch) =>
        set((state) => ({ preferences: { ...state.preferences, ...patch } })),
      reminders: { enabled: false, hour: 12, minute: 0, days: [0, 1, 2, 3, 4, 5, 6] },
      setReminders: (patch) => set((state) => ({ reminders: { ...state.reminders, ...patch } })),
      mealReminders: DEFAULT_MEAL_REMINDERS,
      setMealReminder: (key, patch) =>
        set((state) => ({
          mealReminders: {
            ...state.mealReminders,
            [key]: { ...state.mealReminders[key], ...patch },
          },
        })),
      notificationPrefs: {
        productAlerts: true,
        groupActivity: true,
        replies: true,
        reminders: true,
      },
      setNotificationPrefs: (patch) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...patch } })),
      setLanguage: (language) => set({ language }),
      setSession: (session) => set({ session }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNotificationsPrompted: () => set({ notificationsPrompted: true }),
      setMarketingOptIn: (value) => set({ marketingOptIn: value }),
      acceptTerms: () => set({ acceptedTermsAt: new Date().toISOString() }),
      clear: () =>
        set({
          session: null,
          notificationsEnabled: false,
          notificationsPrompted: false,
          marketingOptIn: true,
          acceptedTermsAt: null,
          workoutsIntroShown: false,
          account: { name: '', username: '', plan: 'free', lastSyncedAt: null },
        }),
    }),
    {
      name: storageKeys.app,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      // Version 1 state only lacks keys; `merge` below fills them from the defaults.
      migrate: (persisted) => persisted as AppState,
      // Older persisted state lacks the Phase 3 preference keys; fill them from the defaults.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...saved,
          preferences: { ...current.preferences, ...(saved.preferences ?? {}) },
          mealReminders: { ...current.mealReminders, ...(saved.mealReminders ?? {}) },
        };
      },
    },
  ),
);
