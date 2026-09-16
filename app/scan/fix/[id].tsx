import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Fix results. Route skeleton; the full screen lands in milestone 5. */
export default function FixResultsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.scanFix')} />}>{null}</Screen>;
}
