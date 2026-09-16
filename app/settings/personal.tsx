import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Personal details. Route skeleton; the full screen lands in milestone 9. */
export default function PersonalDetailsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsPersonal')} />}>{null}</Screen>;
}
