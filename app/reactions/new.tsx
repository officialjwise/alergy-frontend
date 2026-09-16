import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Log reaction. Route skeleton; the full screen lands in milestone 7. */
export default function LogReactionScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.reactionNew')} />}>{null}</Screen>;
}
