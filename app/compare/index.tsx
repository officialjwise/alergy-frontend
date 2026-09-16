import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Compare products. Route skeleton; the full screen lands in milestone 6. */
export default function CompareProductsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.compare')} />}>{null}</Screen>;
}
