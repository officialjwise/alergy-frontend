import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage, storageKeys } from './storage';
import { QUESTIONNAIRE_VERSION } from '@/features/questionnaire/definition';
import type {
  FoodAnswers,
  HealthConditionId,
  QuestionnaireAnswers,
  QuestionnaireTarget,
  TypedFoodResolution,
} from '@/types';

export const emptyAnswers: QuestionnaireAnswers = {
  version: QUESTIONNAIRE_VERSION,
  target: null,
  personName: '',
  existingProfileId: null,
  hasAllergies: null,
  pickedFoods: [],
  typedFoods: [],
  perFood: {},
  hasConditions: null,
  conditions: [],
  conditionEnds: {},
  note: '',
  cameraScanning: null,
  notificationsAsked: false,
};

export const emptyFoodAnswers: FoodAnswers = {
  kind: null,
  kindUnsure: false,
  worst: null,
  strictness: null,
  doctorConfirmed: null,
};

export interface OnboardingState {
  /** Draft answers; the profile is only written when every answer is valid. */
  answers: QuestionnaireAnswers;
  /** Key of the furthest step reached, used to resume after a relaunch. */
  currentStep: string | null;
  hasStarted: boolean;
  completed: boolean;
  /** Set once the setup animation ran so it is not replayed on resume. */
  setupDone: boolean;
  setAnswer: <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => void;
  togglePicked: (id: string) => void;
  addTyped: (text: string, resolution: TypedFoodResolution) => void;
  removeTyped: (index: number) => void;
  setFoodAnswer: (foodId: string, patch: Partial<FoodAnswers>) => void;
  toggleCondition: (id: HealthConditionId) => void;
  setConditionEnd: (id: HealthConditionId, date: string | null) => void;
  setCurrentStep: (step: string) => void;
  markCompleted: () => void;
  markSetupDone: () => void;
  /** Starts a fresh questionnaire for a person (keeps `completed` for the account). */
  startFor: (target: QuestionnaireTarget, existingProfileId?: string) => void;
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
      togglePicked: (id) =>
        set((state) => {
          const picked = state.answers.pickedFoods.includes(id)
            ? state.answers.pickedFoods.filter((item) => item !== id)
            : [...state.answers.pickedFoods, id];
          return { answers: { ...state.answers, pickedFoods: picked } };
        }),
      addTyped: (text, resolution) =>
        set((state) => ({
          answers: {
            ...state.answers,
            typedFoods: [...state.answers.typedFoods, { text: text.trim(), resolution }],
          },
        })),
      removeTyped: (index) =>
        set((state) => ({
          answers: {
            ...state.answers,
            typedFoods: state.answers.typedFoods.filter((_, item) => item !== index),
          },
        })),
      setFoodAnswer: (foodId, patch) =>
        set((state) => ({
          answers: {
            ...state.answers,
            perFood: {
              ...state.answers.perFood,
              [foodId]: { ...(state.answers.perFood[foodId] ?? emptyFoodAnswers), ...patch },
            },
          },
        })),
      toggleCondition: (id) =>
        set((state) => {
          const conditions = state.answers.conditions.includes(id)
            ? state.answers.conditions.filter((item) => item !== id)
            : [...state.answers.conditions, id];
          return { answers: { ...state.answers, conditions } };
        }),
      setConditionEnd: (id, date) =>
        set((state) => ({
          answers: {
            ...state.answers,
            conditionEnds: { ...state.answers.conditionEnds, [id]: date },
          },
        })),
      setCurrentStep: (step) => set({ currentStep: step, hasStarted: true }),
      markCompleted: () => set({ completed: true }),
      markSetupDone: () => set({ setupDone: true }),
      startFor: (target, existingProfileId) =>
        set({
          answers: { ...emptyAnswers, target, existingProfileId: existingProfileId ?? null },
          currentStep: null,
          hasStarted: true,
          setupDone: false,
        }),
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
      version: 2,
      // Version 1 drafts belong to the old survey; start over with the questionnaire.
      migrate: (persisted, version) =>
        version < 2
          ? { ...(persisted as object), answers: emptyAnswers, currentStep: null, setupDone: false }
          : (persisted as OnboardingState),
    },
  ),
);
