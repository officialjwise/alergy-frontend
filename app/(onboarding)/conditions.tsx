import { useTranslation } from 'react-i18next';

import { ChoiceScreen } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { useOnboardingStore } from '@/store/onboardingStore';

type Value = 'yes' | 'no';

/** Question 9: does [name] have a health condition that affects what they eat? */
export default function ConditionsScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const value = useOnboardingStore((state) => state.answers.hasConditions);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  return (
    <ChoiceScreen<Value>
      stepKey="conditions"
      title={copy('q9.title')}
      subtitle={t('q9.subtitle')}
      choices={[
        { value: 'yes', label: t('common.yes'), icon: 'checkCircle' },
        { value: 'no', label: t('common.no'), icon: 'closeCircle' },
      ]}
      selected={value === null ? [] : [value ? 'yes' : 'no']}
      onSelect={(next) => setAnswer('hasConditions', next === 'yes')}
    />
  );
}
