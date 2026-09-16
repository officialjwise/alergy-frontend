import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Session expired. Route skeleton; the full screen lands in milestone 10. */
export default function SessionExpiredScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.sessionExpired')} />}>{null}</Screen>;
}
