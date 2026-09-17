import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, Checkbox, Icon, PressableScale, Text } from '@/components/ui';
import { GoogleMark } from '@/features/auth/GoogleMark';
import { authErrorKey, useSocialSignIn } from '@/features/auth/useAuth';
import { buildProfileFromAnswers } from '@/features/onboarding/buildProfile';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/**
 * "Save your profile": Apple / Google / email buttons with the terms and
 * marketing checkboxes. Creates the profile from the answers on success.
 */
export default function SaveProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [terms, setTerms] = useState(true);
  const marketing = useAppStore((state) => state.marketingOptIn);
  const setMarketing = useAppStore((state) => state.setMarketingOptIn);
  const acceptTerms = useAppStore((state) => state.acceptTerms);
  const [error, setError] = useState<string | null>(null);
  const { signIn, pending } = useSocialSignIn();

  const session = useAppStore((state) => state.session);
  const answers = useOnboardingStore((state) => state.answers);
  const profiles = useProfileStore((state) => state.profiles);
  const addProfile = useProfileStore((state) => state.addProfile);

  const createProfile = useCallback(() => {
    if (
      profiles.length === 0 ||
      !profiles.some(
        (p) =>
          p.profileFor === answers.profileFor &&
          p.name === (answers.profileName.trim() || t('profile.for_myself')),
      )
    ) {
      addProfile(buildProfileFromAnswers(answers, profiles.length, t('profile.for_myself')), true);
    }
  }, [addProfile, answers, profiles, t]);

  const requireTerms = useCallback((): boolean => {
    if (!terms) {
      setError(t('saveProfile.termsRequired'));
      return false;
    }
    setError(null);
    acceptTerms();
    return true;
  }, [acceptTerms, t, terms]);

  const social = useCallback(
    async (provider: 'apple' | 'google') => {
      if (!requireTerms()) return;
      try {
        await signIn(provider);
        createProfile();
        router.push('/(onboarding)/notifications');
      } catch (caught) {
        const key = authErrorKey(caught);
        if (key) setError(t(key));
      }
    },
    [createProfile, requireTerms, router, signIn, t],
  );

  const email = useCallback(() => {
    if (!requireTerms()) return;
    router.push('/(auth)/email' as Href);
  }, [requireTerms, router]);

  const termsLabel = (
    <Text variant="body" color="textBody">
      {t('saveProfile.terms').split(t('saveProfile.termsLink'))[0]}
      <Text
        variant="body"
        color="text"
        style={styles.link}
        onPress={() => router.push('/legal/terms' as Href)}
        accessibilityRole="link"
      >
        {t('saveProfile.termsLink')}
      </Text>
      {' and '}
      <Text
        variant="body"
        color="text"
        style={styles.link}
        onPress={() => router.push('/legal/privacy' as Href)}
        accessibilityRole="link"
      >
        {t('saveProfile.privacyLink')}
      </Text>
    </Text>
  );

  if (session) {
    // Already signed in (adding another profile): no need to authenticate again.
    return (
      <OnboardingScreen
        route="save-profile"
        title={t('saveProfile.title')}
        footer={
          <Button
            title={t('common.save')}
            onPress={() => {
              createProfile();
              router.push('/(onboarding)/notifications');
            }}
            haptic="medium"
          />
        }
      >
        <Text variant="subtitle" color="textMuted" style={styles.signedIn}>
          {t('settings.signedInAs', { email: session.user.email ?? session.user.provider })}
        </Text>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen route="save-profile" title={t('saveProfile.title')} subtitle={t('saveProfile.subtitle')}>
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
        />
        <Button
          title={t('saveProfile.email')}
          variant="text"
          onPress={email}
          disabled={pending !== null}
          haptic="medium"
        />
      </View>
      {error ? (
        <Text variant="body" color="danger" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <View style={styles.checks}>
        <Checkbox
          checked={terms}
          onChange={setTerms}
          label={termsLabel}
          accessibilityLabel={t('saveProfile.terms')}
          testID="terms-checkbox"
        />
        <Checkbox
          checked={marketing}
          onChange={setMarketing}
          label={t('saveProfile.marketing')}
          testID="marketing-checkbox"
        />
      </View>
      <PressableScale style={styles.hidden} accessible={false} />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  buttons: { marginTop: rv(spacing.xl), gap: rs(spacing.sm) },
  error: { marginTop: rs(spacing.md) },
  checks: { marginTop: rv(spacing.xl), gap: rv(spacing.lg) },
  link: { textDecorationLine: 'underline' },
  hidden: { height: 0 },
  signedIn: { marginTop: rv(spacing.xl) },
});
