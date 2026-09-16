import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Change email. Route skeleton; the full screen lands in milestone 9. */
export default function ChangeEmailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsChangeEmail')} />}>{null}</Screen>;
}
