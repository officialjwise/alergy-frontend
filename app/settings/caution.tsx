import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Caution level. Route skeleton; the full screen lands in milestone 9. */
export default function CautionLevelScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsCaution')} />}>{null}</Screen>;
}
