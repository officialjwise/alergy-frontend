import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Notifications. Route skeleton; the full screen lands in milestone 9. */
export default function NotificationsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.notifications')} />}>{null}</Screen>;
}
