import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Analyzing. Route skeleton; the full screen lands in milestone 4. */
export default function AnalyzingScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.scanAnalyzing')} />}>{null}</Screen>;
}
