import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Badges. Route skeleton; the full screen lands in milestone 7. */
export default function BadgesScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.badges')} />}>{null}</Screen>;
}
