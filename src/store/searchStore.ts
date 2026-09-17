import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from './storage';

const MAX_RECENT = 8;

interface SearchState {
  recent: string[];
  addRecent: (query: string) => void;
  removeRecent: (query: string) => void;
  clearRecent: () => void;
}

/** Recent food searches, newest first, kept on the device. */
export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recent: [],
      addRecent: (query) =>
        set((state) => {
          const clean = query.trim();
          if (!clean) return state;
          const rest = state.recent.filter((item) => item.toLowerCase() !== clean.toLowerCase());
          return { recent: [clean, ...rest].slice(0, MAX_RECENT) };
        }),
      removeRecent: (query) =>
        set((state) => ({ recent: state.recent.filter((item) => item !== query) })),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'allergy-app.search', storage: createJSONStorage(() => mmkvStateStorage), version: 1 },
  ),
);
