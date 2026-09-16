import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Family plan. Route skeleton; the full screen lands in milestone 9. */
export default function FamilyPlanScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsFamilyPlan')} />}>{null}</Screen>;
}
