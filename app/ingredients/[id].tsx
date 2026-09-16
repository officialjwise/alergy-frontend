import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Ingredient. Route skeleton; the full screen lands in milestone 6. */
export default function IngredientDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.ingredient')} />}>{null}</Screen>;
}
