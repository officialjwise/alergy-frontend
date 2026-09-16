import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import type { Ingredient, OnboardingAnswers, Severity } from '@/types';

export const emptyAnswers: OnboardingAnswers = {
  profileFor: null,
  profileName: '',
  birthDate: null,
  frequency: null,
  triedOtherApps: null,
  watchFor: [],
  ingredients: [],
  customIngredients: {},
  severities: {},
  reasons: [],
  cautionLevel: null,
  challenges: [],
  diet: null,
  goal: null,
  cameraScanning: null,
  rememberFoods: null,
  notificationsAsked: false,
};

export interface OnboardingState {
  answers: OnboardingAnswers;
  /** Route name of the furthest step reached, used to resume after a relaunch. */
  currentStep: string | null;
  /** Steps that were visited, so resuming lands on the right one. */
  hasStarted: boolean;
  completed: boolean;
  /** Set once the summary was generated so the setup animation is not replayed. */
  setupDone: boolean;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  toggleMulti: <K extends 'watchFor' | 'reasons' | 'challenges'>(
    key: K,
    value: OnboardingAnswers[K][number],
  ) => void;
  addIngredient: (id: string, custom?: Ingredient) => void;
  removeIngredient: (id: string) => void;
  setSeverity: (id: string, severity: Severity) => void;
  setAllSeverities: (severity: Severity) => void;
  setCurrentStep: (step: string) => void;
  markCompleted: () => void;
  markSetupDone: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: emptyAnswers,
      currentStep: null,
      hasStarted: false,
      completed: false,
      setupDone: false,
      setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
      toggleMulti: (key, value) =>
        set((state) => {
          const current = state.answers[key] as string[];
          const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
          return { answers: { ...state.answers, [key]: next } };
        }),
      addIngredient: (id, custom) =>
        set((state) => {
          if (state.answers.ingredients.includes(id)) return state;
          return {
            answers: {
              ...state.answers,
              ingredients: [...state.answers.ingredients, id],
              customIngredients: custom
                ? { ...state.answers.customIngredients, [id]: custom }
                : state.answers.customIngredients,
            },
          };
        }),
      removeIngredient: (id) =>
        set((state) => {
          const { [id]: _removedSeverity, ...severities } = state.answers.severities;
          const { [id]: _removedCustom, ...customIngredients } = state.answers.customIngredients;
          return {
            answers: {
              ...state.answers,
              ingredients: state.answers.ingredients.filter((item) => item !== id),
              severities,
              customIngredients,
            },
          };
        }),
      setSeverity: (id, severity) =>
        set((state) => ({
          answers: {
            ...state.answers,
            severities: { ...state.answers.severities, [id]: severity },
          },
        })),
      setAllSeverities: (severity) =>
        set((state) => ({
          answers: {
            ...state.answers,
            severities: Object.fromEntries(state.answers.ingredients.map((id) => [id, severity])),
          },
        })),
      setCurrentStep: (step) => set({ currentStep: step, hasStarted: true }),
      markCompleted: () => set({ completed: true }),
      markSetupDone: () => set({ setupDone: true }),
      reset: () =>
        set({
          answers: emptyAnswers,
          currentStep: null,
          hasStarted: false,
          completed: false,
          setupDone: false,
        }),
    }),
    {
      name: storageKeys.onboarding,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 1,
    },
  ),
);
