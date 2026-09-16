import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** New private group. Route skeleton; the full screen lands in milestone 8. */
export default function CreateGroupScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.groupNew')} />}>{null}</Screen>;
}
