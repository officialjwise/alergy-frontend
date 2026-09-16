import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Export summary report. Route skeleton; the full screen lands in milestone 9. */
export default function ExportReportScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsExport')} />}>{null}</Screen>;
}
