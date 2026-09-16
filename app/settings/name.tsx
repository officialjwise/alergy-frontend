import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Name and username. Route skeleton; the full screen lands in milestone 9. */
export default function EditNameScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsName')} />}>{null}</Screen>;
}
