import { create } from 'zustand';

interface PlusMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

/** Shared by the tab bar (+ button) and the overlay that draws the 2x2 tiles. */
export const usePlusMenuStore = create<PlusMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
