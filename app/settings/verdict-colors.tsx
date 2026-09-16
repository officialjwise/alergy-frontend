import { useTranslation } from 'react-i18next';

import { NavHeader, Screen } from '@/components/ui';

/** Verdict colors explained. Route skeleton; the full screen lands in milestone 9. */
export default function VerdictColorsScreen() {
  const { t } = useTranslation();
  return <Screen header={<NavHeader title={t('routes.settingsVerdictColors')} />}>{null}</Screen>;
}
