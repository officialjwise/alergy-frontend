import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import type { AuthSession, LanguageCode } from '@/types';

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
        }),
    }),
    {
      name: storageKeys.app,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 1,
    },
  ),
);
