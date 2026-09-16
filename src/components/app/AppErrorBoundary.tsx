import type { ErrorBoundaryProps } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ErrorState, Screen } from '@/components/ui';

/** Route-level error boundary: shows the shared error state with a retry that re-renders the route. */
export function AppErrorBoundary({ retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <Screen>
      <ErrorState
        title={t('states.errorTitle')}
        body={t('states.errorBody')}
        actionLabel={t('common.retry')}
        onAction={() => void retry()}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    </Screen>
  );
}
