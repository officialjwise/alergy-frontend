import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Request a feature. Route skeleton; the full screen lands in milestone 9. */
export default function RequestFeatureScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsRequestFeature')} />}>{null}</Screen>;
}
