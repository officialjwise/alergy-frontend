import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Update required. Route skeleton; the full screen lands in milestone 10. */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.updateRequired')} />}>{null}</Screen>;
}
