import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Report post. Route skeleton; the full screen lands in milestone 8. */
export default function ReportPostScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.postReport')} />}>{null}</Screen>;
}
