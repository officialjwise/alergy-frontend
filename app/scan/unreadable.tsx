import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Photo unreadable. Route skeleton; the full screen lands in milestone 5. */
export default function UnreadableScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.scanUnreadable')} />}>{null}</Screen>;
}
