import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Food search. Route skeleton; the full screen lands in milestone 6. */
export default function FoodSearchScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.search')} />}>{null}</Screen>;
}
