import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Delete account. Route skeleton; the full screen lands in milestone 9. */
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsDeleteAccount')} />}>{null}</Screen>;
}
