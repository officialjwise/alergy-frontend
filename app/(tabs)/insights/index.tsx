import { useTranslation } from 'react-i18next';

import { LargeTitleHeader, Screen } from '@/components/ui';

/** Insights tab. Route skeleton; the nine cards land in milestone 7. */
export default function InsightsScreen() {
  const { t } = useTranslation();
  return (
    <Screen tabBar header={<LargeTitleHeader title={t('routes.insights')} />}>
      {null}
    </Screen>
  );
}
