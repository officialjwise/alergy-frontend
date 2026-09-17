import type { ErrorBoundaryProps } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorState, Screen, useIsOffline } from '@/components/ui';
import { OfflineContent } from './OfflineContent';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/**
 * Route-level error boundary. Offline it shows the no-internet state with a
 * retry; otherwise the shared error state whose retry re-renders the route.
 */
export function AppErrorBoundary({ retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const offline = useIsOffline();
  if (offline) {
    return (
      <Screen
        footer={
          <View style={styles.actions}>
            <Button title={t('offline.retry')} onPress={() => void retry()} haptic="medium" />
          </View>
        }
      >
        <OfflineContent />
      </Screen>
    );
  }
  return (
    <Screen>
      <ErrorState
        title={t('states.errorTitle')}
        body={t('states.errorBody')}
        actionLabel={t('common.retry')}
        onAction={() => void retry()}
        style={styles.center}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  actions: { gap: rs(spacing.sm) },
});
