import { useLocalSearchParams } from 'expo-router';

import { foodName } from './rules';
import { emptyFoodAnswers, useOnboardingStore } from '@/store/onboardingStore';
import { stepKey } from '@/features/onboarding/steps';
import type { FoodAnswers } from '@/types';

/** The food a per-food question screen is about (from the `id` route param). */
export function useFoodStep(route: string) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const foodId = id ?? '';
  const answers = useOnboardingStore((state) => state.answers);
  const setFoodAnswer = useOnboardingStore((state) => state.setFoodAnswer);
  const food: FoodAnswers = answers.perFood[foodId] ?? emptyFoodAnswers;
  return {
    foodId,
    name: foodName(answers, foodId),
    food,
    set: (patch: Partial<FoodAnswers>) => setFoodAnswer(foodId, patch),
    stepKey: stepKey(route, foodId),
  };
}
