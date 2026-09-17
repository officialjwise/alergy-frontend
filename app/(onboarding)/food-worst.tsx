import { useTranslation } from 'react-i18next';

import { ChoiceScreen, QuestionNote } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { WORST_REACTIONS } from '@/features/questionnaire/definition';
import { useFoodStep } from '@/features/questionnaire/useFoodStep';
import type { WorstReaction } from '@/types';

/** Question 6: how bad has the worst reaction been? "Not sure" is treated as severe. */
export default function FoodWorstScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const { name, food, set, stepKey } = useFoodStep('food-worst');
  return (
    <ChoiceScreen<WorstReaction>
      stepKey={stepKey}
      title={copy('q6.title', { food: name })}
      choices={WORST_REACTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        hint: option.hintKey ? t(option.hintKey) : undefined,
        icon: option.icon,
      }))}
      selected={food.worst ? [food.worst] : []}
      onSelect={(value) => set({ worst: value })}
      note={
        food.worst ? (
          <QuestionNote>
            {t(food.worst === 'unsure' ? 'q6.unsureNote' : food.worst === 'mild' ? 'q6.warningNote' : 'q6.highNote')}
          </QuestionNote>
        ) : undefined
      }
      compact
    />
  );
}
