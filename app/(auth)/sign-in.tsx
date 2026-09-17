import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { BackButton, Button, Icon, Screen, Text } from '@/components/ui';
import { GoogleMark } from '@/features/auth/GoogleMark';
import { authErrorKey, useSocialSignIn } from '@/features/auth/useAuth';
import { useProfileStore } from '@/store/profileStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/** Sign in for returning users: Apple, Google or email, then straight to Home when a profile exists. */
export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, pending } = useSocialSignIn();
  const hasProfile = useProfileStore((state) => state.profiles.length > 0);
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(() => {
    router.replace(hasProfile ? '/(tabs)/home' : ('/(onboarding)/who' as Href));
  }, [hasProfile, router]);

  const social = useCallback(
    async (provider: 'apple' | 'google') => {
      setError(null);
      try {
        await signIn(provider);
        finish();
      } catch (caught) {
        const key = authErrorKey(caught);
        if (key) setError(t(key));
      }
    },
    [finish, signIn, t],
  );

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      footer={
        <Text variant="small" color="textMuted" align="center">
          {t('signIn.terms')}
        </Text>
      }
      testID="sign-in"
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('signIn.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('signIn.subtitle')}
      </Text>
      <View style={styles.buttons}>
        {Platform.OS === 'ios' ? (
          <Button
            title={t('saveProfile.apple')}
            variant="apple"
            size="lg"
            leading={<Icon name="apple" size={rs(24)} color="onPrimary" />}
            onPress={() => void social('apple')}
            loading={pending === 'apple'}
            disabled={pending !== null}
            haptic="medium"
            testID="sign-in-apple"
          />
        ) : null}
        <Button
          title={t('saveProfile.google')}
          variant="secondary"
          size="lg"
          leading={<GoogleMark size={rs(22)} />}
          onPress={() => void social('google')}
          loading={pending === 'google'}
          disabled={pending !== null}
          haptic="medium"
          testID="sign-in-google"
        />
        <Button
          title={t('saveProfile.email')}
          variant="text"
          onPress={() => router.push({ pathname: '/(auth)/email', params: { next: 'home' } } as Href)}
          disabled={pending !== null}
          testID="sign-in-email"
        />
      </View>
      {error ? (
        <Text variant="body" color="danger" align="center" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(spacing.sm) },
  buttons: { marginTop: rv(spacing.huge), gap: rs(spacing.sm) },
  error: { marginTop: rs(spacing.md) },
});
