import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, IconChip, NavHeader, Screen, Text } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/** Shown at launch when the stored session is past its expiry; sends the user back to sign in. */
export default function SessionExpiredScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAppStore((state) => state.setSession);

  const continueWithout = () => {
    setSession(null);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen
      header={<NavHeader leftIcon="none" />}
      footer={
        <View style={styles.actions}>
          <Button
            title={t('sessionExpired.signIn')}
            onPress={() => router.replace({ pathname: '/(auth)/email', params: { next: 'home' } })}
            haptic="medium"
            testID="session-sign-in"
          />
          <Button
            title={t('sessionExpired.later')}
            variant="text"
            onPress={continueWithout}
            testID="session-later"
          />
        </View>
      }
      testID="session-expired"
    >
      <View style={styles.hero}>
        <IconChip icon="lock" size={88} iconSize={40} background="surfaceTint" outline />
        <Text variant="title" color="text" align="center" accessibilityRole="header">
          {t('sessionExpired.title')}
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          {t('sessionExpired.body')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(spacing.md),
    paddingTop: rv(layout.titleTop),
  },
  actions: { gap: rs(spacing.xs) },
});
