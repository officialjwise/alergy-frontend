import { useTranslation } from 'react-i18next';

import { ChoiceScreen, QuestionNote } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { REACTION_KINDS } from '@/features/questionnaire/definition';
import { useFoodStep } from '@/features/questionnaire/useFoodStep';
import type { ReactionKind } from '@/types';

type Value = ReactionKind | 'unsure';

/** Question 5: what happens when [name] eats [food]? "Not sure" is recorded as an allergy. */
export default function FoodReactionScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const { name, food, set, stepKey } = useFoodStep('food-reaction');
  const selected: Value[] = food.kind ? [food.kindUnsure ? 'unsure' : food.kind] : [];
  return (
    <ChoiceScreen<Value>
      stepKey={stepKey}
      title={copy('q5.title', { food: name })}
      choices={REACTION_KINDS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        hint: option.hintKey ? t(option.hintKey) : undefined,
        icon: option.icon,
      }))}
      selected={selected}
      onSelect={(value) => {
        const kind: ReactionKind = value === 'unsure' ? 'allergy' : value;
        set({
          kind,
          kindUnsure: value === 'unsure',
          // A different kind of reaction resets the follow-up answers.
          ...(kind === 'choice' ? { worst: null, doctorConfirmed: null } : { strictness: null }),
        });
      }}
      note={food.kindUnsure ? <QuestionNote>{t('q5.unsureNote')}</QuestionNote> : undefined}
      compact
    />
  );
}
