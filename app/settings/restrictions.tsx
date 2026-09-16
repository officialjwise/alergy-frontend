import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** My allergens and ingredients. Route skeleton; the full screen lands in milestone 9. */
export default function RestrictionsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsRestrictions')} />}>{null}</Screen>;
}
