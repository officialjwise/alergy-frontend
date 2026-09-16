import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Group. Route skeleton; the full screen lands in milestone 8. */
export default function GroupDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.groupDetail')} />}>{null}</Screen>;
}
