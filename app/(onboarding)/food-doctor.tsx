import { useTranslation } from 'react-i18next';

import { ChoiceScreen } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { DOCTOR_OPTIONS } from '@/features/questionnaire/definition';
import { useFoodStep } from '@/features/questionnaire/useFoodStep';
import type { DoctorConfirmed } from '@/types';

/** Question 8 (optional): has a doctor confirmed it? Saved for reference only. */
export default function FoodDoctorScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const { name, food, set, stepKey } = useFoodStep('food-doctor');
  return (
    <ChoiceScreen<DoctorConfirmed>
      stepKey={stepKey}
      title={copy('q8.title', { food: name })}
      subtitle={t('q8.subtitle')}
      choices={DOCTOR_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
        icon: option.icon,
      }))}
      selected={food.doctorConfirmed ? [food.doctorConfirmed] : []}
      onSelect={(value) => set({ doctorConfirmed: value })}
      valid
      onSkip={() => set({ doctorConfirmed: null })}
      skipLabel={t('common.skip')}
      compact
    />
  );
}
