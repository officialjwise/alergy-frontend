import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Invite. Route skeleton; the full screen lands in milestone 8. */
export default function GroupInviteScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.groupInvite')} />}>{null}</Screen>;
}
