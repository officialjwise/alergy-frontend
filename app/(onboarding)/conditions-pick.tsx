import { useTranslation } from 'react-i18next';

import { ChoiceScreen } from '@/components/onboarding/ChoiceScreen';
import { useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { HEALTH_CONDITIONS } from '@/features/questionnaire/definition';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { HealthConditionId } from '@/types';

/** Question 10: which of these apply to [name]? */
export default function ConditionsPickScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const conditions = useOnboardingStore((state) => state.answers.conditions);
  const toggleCondition = useOnboardingStore((state) => state.toggleCondition);
  return (
    <ChoiceScreen<HealthConditionId>
      stepKey="conditions-pick"
      title={copy('q10.title')}
      subtitle={t('q10.subtitle')}
      choices={HEALTH_CONDITIONS.map((item) => ({
        value: item.id,
        label: t(`conditions.${item.id}`),
        icon: item.icon,
      }))}
      selected={conditions}
      onSelect={toggleCondition}
      multi
      compact
    />
  );
}
