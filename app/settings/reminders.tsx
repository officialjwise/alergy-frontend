import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Scan reminders. Route skeleton; the full screen lands in milestone 9. */
export default function ScanRemindersScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsReminders')} />}>{null}</Screen>;
}
