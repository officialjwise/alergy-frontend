import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Document. Route skeleton; the full screen lands in milestone 7. */
export default function ActionPlanPhotoScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.actionPlanPhoto')} />}>{null}</Screen>;
}
