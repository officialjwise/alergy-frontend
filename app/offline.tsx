import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** No internet. Route skeleton; the full screen lands in milestone 10. */
export default function OfflineScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.offline')} />}>{null}</Screen>;
}
