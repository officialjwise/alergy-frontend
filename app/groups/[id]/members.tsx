import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Members. Route skeleton; the full screen lands in milestone 8. */
export default function GroupMembersScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.groupMembers')} />}>{null}</Screen>;
}
