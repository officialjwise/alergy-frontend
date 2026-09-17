import { useTranslation } from 'react-i18next';

import { ChoiceScreen, QuestionNote } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { HasAllergiesAnswer } from '@/types';

/** Question 2: any food allergies or intolerances, or foods they must avoid? */
export default function AllergiesScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const value = useOnboardingStore((state) => state.answers.hasAllergies);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  return (
    <ChoiceScreen<HasAllergiesAnswer>
      stepKey="allergies"
      title={copy('q2.title')}
      choices={[
        { value: 'yes', label: t('common.yes'), icon: 'checkCircle' },
        { value: 'no', label: t('common.no'), icon: 'closeCircle' },
        { value: 'unsure', label: t('q2.unsure'), hint: t('q2.unsureHint'), icon: 'helpCircle' },
      ]}
      selected={value ? [value] : []}
      onSelect={(next) => setAnswer('hasAllergies', next)}
      note={value === 'unsure' ? <QuestionNote>{t('q2.unsureNote')}</QuestionNote> : undefined}
    />
  );
}
