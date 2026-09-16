import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Reaction. Route skeleton; the full screen lands in milestone 7. */
export default function ReactionDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.reactionDetail')} />}>{null}</Screen>;
}
