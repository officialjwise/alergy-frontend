import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Other answers. Route skeleton; the full screen lands in milestone 9. */
export default function SurveyAnswersScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsSurvey')} />}>{null}</Screen>;
}
