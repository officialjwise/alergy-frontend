import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** New post. Route skeleton; the full screen lands in milestone 8. */
export default function CreatePostScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.postNew')} />}>{null}</Screen>;
}
