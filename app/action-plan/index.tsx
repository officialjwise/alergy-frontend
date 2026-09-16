import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Allergy action plan. Route skeleton; the full screen lands in milestone 7. */
export default function ActionPlanScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.actionPlan')} />}>{null}</Screen>;
}
