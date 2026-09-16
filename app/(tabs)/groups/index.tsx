import { useTranslation } from 'react-i18next';

import { LargeTitleHeader, Screen } from '@/components/ui';

/** Groups tab. Route skeleton; discover and my groups land in milestone 8. */
export default function GroupsScreen() {
  const { t } = useTranslation();
  return (
    <Screen tabBar header={<LargeTitleHeader title={t('routes.groups')} />}>
      {null}
    </Screen>
  );
}
