import * as Notifications from 'expo-notifications';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, IconChip } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing } from '@/theme/tokens';
import { rv } from '@/theme/responsive';

/** Optional, skippable notification prompt (not in the PDF). Last onboarding step before the main app. */
export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const setNotificationsPrompted = useAppStore((state) => state.setNotificationsPrompted);
  const markCompleted = useOnboardingStore((state) => state.markCompleted);

  const finish = useCallback(() => {
    setNotificationsPrompted();
    markCompleted();
    router.replace('/(tabs)/home' as Href);
  }, [markCompleted, router, setNotificationsPrompted]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const result = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(result.granted);
    } catch {
      setNotificationsEnabled(false);
    } finally {
      setBusy(false);
      finish();
    }
  }, [finish, setNotificationsEnabled]);

  return (
    <OnboardingScreen
      route="notifications"
      header={false}
      title={t('permissions.notificationsTitle')}
      subtitle={t('permissions.notificationsSubtitle')}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('permissions.notificationsAllow')}
            onPress={() => void enable()}
            loading={busy}
            haptic="medium"
          />
          <Button
            title={t('permissions.notificationsSkip')}
            variant="text"
            onPress={finish}
            disabled={busy}
          />
        </View>
      }
    >
      <View style={styles.illustration}>
        <IconChip icon="bell" size={120} iconSize={52} outline background="surfaceTint" />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  illustration: { alignItems: 'center', marginTop: rv(spacing.massive) },
  footer: { gap: spacing.xs },
});
