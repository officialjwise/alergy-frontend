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
  appearance: 'light' | 'system';
  defaultScanMode: ScanMode;
}

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
  /** The product alerts intro sheet was shown (once, after the first saved food). */
  featureIntroShown: boolean;
  setFeatureIntroShown: () => void;
  account: AccountInfo;
  setAccount: (patch: Partial<AccountInfo>) => void;
  preferences: Preferences;
  setPreferences: (patch: Partial<Preferences>) => void;
  reminders: ReminderSettings;
  setReminders: (patch: Partial<ReminderSettings>) => void;
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
      featureIntroShown: false,
      setFeatureIntroShown: () => set({ featureIntroShown: true }),
      account: { name: '', username: '', plan: 'free', lastSyncedAt: null },
      setAccount: (patch) => set((state) => ({ account: { ...state.account, ...patch } })),
      preferences: { haptics: true, appearance: 'light', defaultScanMode: 'food' },
      setPreferences: (patch) =>
        set((state) => ({ preferences: { ...state.preferences, ...patch } })),
      reminders: { enabled: false, hour: 12, minute: 0, days: [0, 1, 2, 3, 4, 5, 6] },
      setReminders: (patch) => set((state) => ({ reminders: { ...state.reminders, ...patch } })),
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
          featureIntroShown: false,
          account: { name: '', username: '', plan: 'free', lastSyncedAt: null },
        }),
    }),
    {
      name: storageKeys.app,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 1,
    },
  ),
);
