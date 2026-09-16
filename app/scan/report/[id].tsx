import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Report a problem. Route skeleton; the full screen lands in milestone 5. */
export default function ReportProblemScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.scanReport')} />}>{null}</Screen>;
}
