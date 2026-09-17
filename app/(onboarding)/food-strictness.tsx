import { useTranslation } from 'react-i18next';

import { ChoiceScreen } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { STRICTNESS_OPTIONS } from '@/features/questionnaire/definition';
import { useFoodStep } from '@/features/questionnaire/useFoodStep';
import type { Strictness } from '@/types';

/** Question 7: how strictly does [name] avoid [food]? Only for foods avoided by choice. */
export default function FoodStrictnessScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const { name, food, set, stepKey } = useFoodStep('food-strictness');
  return (
    <ChoiceScreen<Strictness>
      stepKey={stepKey}
      title={copy('q7.title', { food: name })}
      choices={STRICTNESS_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        hint: option.hintKey ? t(option.hintKey) : undefined,
        icon: option.icon,
      }))}
      selected={food.strictness ? [food.strictness] : []}
      onSelect={(value) => set({ strictness: value })}
    />
  );
}
