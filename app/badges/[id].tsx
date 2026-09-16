import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Badge. Route skeleton; the full screen lands in milestone 7. */
export default function BadgeDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.badgeDetail')} />}>{null}</Screen>;
}
