import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Saved foods. Route skeleton; the full screen lands in milestone 6. */
export default function SavedFoodsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.saved')} />}>{null}</Screen>;
}
