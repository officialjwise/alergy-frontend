import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Member. Route skeleton; the full screen lands in milestone 8. */
export default function MemberDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.member')} />}>{null}</Screen>;
}
