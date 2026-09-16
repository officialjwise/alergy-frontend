import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Preferences. Route skeleton; the full screen lands in milestone 9. */
export default function PreferencesScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsPreferences')} />}>{null}</Screen>;
}
