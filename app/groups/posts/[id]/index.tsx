import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Post. Route skeleton; the full screen lands in milestone 8. */
export default function PostDetailScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.postDetail')} />}>{null}</Screen>;
}
