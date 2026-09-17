import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OfflineContent } from '@/components/app/OfflineContent';
import { Button, NavHeader, Screen, showToast } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Full screen "no internet" state with a retry; used when a screen cannot load without a connection. */
export default function OfflineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const retry = async () => {
    setChecking(true);
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected && state.isInternetReachable !== false) {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/home');
      } else {
        showToast({ message: t('offline.stillOffline'), icon: 'wifiOff' });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen
      header={<NavHeader leftIcon={router.canGoBack() ? 'arrowBack' : 'none'} />}
      footer={
        <View style={styles.actions}>
          <Button
            title={t('offline.retry')}
            onPress={() => void retry()}
            loading={checking}
            haptic="medium"
            testID="offline-retry"
          />
          <Button
            title={t('offline.saved')}
            variant="secondary"
            onPress={() => router.push('/saved')}
            testID="offline-saved"
          />
        </View>
      }
      testID="offline"
    >
      <OfflineContent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: rs(spacing.sm) },
});
