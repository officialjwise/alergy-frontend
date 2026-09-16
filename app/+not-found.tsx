import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen, StateView } from '@/components/ui';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen>
      <StateView
        icon="helpCircle"
        title={t('states.errorTitle')}
        body={t('states.errorBody')}
        actionLabel={t('tabs.home')}
        onAction={() => router.replace('/')}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    </Screen>
  );
}
