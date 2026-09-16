import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Product not found. Route skeleton; the full screen lands in milestone 5. */
export default function NotFoundScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.scanNotFound')} />}>{null}</Screen>;
}
