import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from './storage';

/** Which mock data set the services serve: a brand-new user or an active one. */
export type MockDataset = 'new' | 'active';

export interface DevState {
  /** Draws the page padding guides over every screen. */
  showGuides: boolean;
  mockDataset: MockDataset;
  /** Sends the app to the update-required screen on next launch (preview only). */
  forceUpdateRequired: boolean;
  setForceUpdateRequired: (value: boolean) => void;
  setShowGuides: (value: boolean) => void;
  setMockDataset: (dataset: MockDataset) => void;
}

/**
 * Developer-only toggles reached from the hidden gallery (`/dev/components`).
 * Persisted so the choice survives reloads while testing.
 */
export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      showGuides: false,
      mockDataset: 'active',
      forceUpdateRequired: false,
      setForceUpdateRequired: (value) => set({ forceUpdateRequired: value }),
      setShowGuides: (value) => set({ showGuides: value }),
      setMockDataset: (dataset) => set({ mockDataset: dataset }),
    }),
    { name: 'allergy-app.dev', storage: createJSONStorage(() => mmkvStateStorage), version: 1 },
  ),
);
