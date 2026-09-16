import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Reactions. Route skeleton; the full screen lands in milestone 7. */
export default function ReactionHistoryScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.reactions')} />}>{null}</Screen>;
}
