import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { BackButton, Button, PressableScale, Screen, Text } from '@/components/ui';
import { authErrorKey, useEmailCode } from '@/features/auth/useAuth';
import { buildProfileFromAnswers } from '@/features/onboarding/buildProfile';
import { validateAnswers } from '@/features/questionnaire/rules';
import { apiMode, mockConfig } from '@/services';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { borders, colors, layout, radii, spacing } from '@/theme/tokens';
import { rf, rs, rv } from '@/theme/responsive';
import { fontFamily } from '@/theme/typography';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

/** 6-digit verification code screen with resend timer and error states. */
export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email, next } = useLocalSearchParams<{ email: string; next?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const { request, verify } = useEmailCode();
  const answers = useOnboardingStore((state) => state.answers);
  const profiles = useProfileStore((state) => state.profiles);
  const addProfile = useProfileStore((state) => state.addProfile);

  useEffect(() => {
    if (seconds <= 0) return;
    const handle = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(handle);
  }, [seconds]);

  const submit = useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH || !email) return;
      setError(null);
      try {
        await verify.mutateAsync({ email, code: value });
        if (profiles.length === 0 && answers.target && validateAnswers(answers, { canAddPerson: true }).length === 0) {
          const { profile } = buildProfileFromAnswers(answers, null, 0);
          addProfile({ ...profile, name: profile.name || t('profile.for_myself') }, true);
        }
        router.replace((next === 'home' ? '/(tabs)/home' : '/(onboarding)/notifications') as Href);
      } catch (caught) {
        const key = authErrorKey(caught);
        setError(key ? t(key) : null);
        setCode('');
      }
    },
    [addProfile, answers, email, profiles.length, router, t, verify, next],
  );

  const onChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (error) setError(null);
    if (digits.length === CODE_LENGTH) void submit(digits);
  };

  const resend = useCallback(async () => {
    if (!email) return;
    try {
      await request.mutateAsync(email);
      setSeconds(RESEND_SECONDS);
      setError(null);
    } catch (caught) {
      const key = authErrorKey(caught);
      if (key) setError(t(key));
    }
  }, [email, request, t]);

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      keyboardAvoiding
      footer={
        <View style={styles.footer}>
          <Button
            title={t('email.verify')}
            onPress={() => void submit(code)}
            disabled={code.length !== CODE_LENGTH}
            loading={verify.isPending}
            haptic="medium"
          />
          <Button
            title={seconds > 0 ? t('email.resendIn', { seconds }) : t('email.resend')}
            variant="text"
            onPress={() => void resend()}
            disabled={seconds > 0 || request.isPending}
          />
        </View>
      }
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('email.codeTitle')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('email.codeSubtitle', { email })}
      </Text>

      <PressableScale
        onPress={() => inputRef.current?.focus()}
        pressedScale={1}
        style={styles.boxes}
        accessible={false}
      >
        {Array.from({ length: CODE_LENGTH }, (_, index) => {
          const digit = code[index] ?? '';
          const active = index === Math.min(code.length, CODE_LENGTH - 1);
          return (
            <View
              key={index}
              style={[styles.box, active ? styles.boxActive : null, error ? styles.boxError : null]}
            >
              <Text variant="title" color="text" style={styles.digit}>
                {digit}
              </Text>
            </View>
          );
        })}
      </PressableScale>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        autoFocus
        style={styles.hiddenInput}
        accessibilityLabel={t('email.codeA11y', { index: code.length + 1 })}
        caretHidden
      />
      {error ? (
        <Text variant="body" color="danger" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {apiMode === 'mock' ? (
        <Text variant="small" color="textMuted" style={styles.hint}>
          {t('email.devHint', { code: mockConfig.emailCode })}
        </Text>
      ) : null}
      <Button
        title={t('email.changeEmail')}
        variant="text"
        onPress={() => router.back()}
        style={styles.change}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: rv(spacing.xxxl),
    gap: rs(spacing.xs),
  },
  box: {
    flex: 1,
    aspectRatio: 0.82,
    maxWidth: 60,
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.primary, borderWidth: borders.selected },
  boxError: { borderColor: colors.danger },
  digit: { fontFamily: fontFamily.semibold, fontSize: rf(28), lineHeight: rf(34) },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },
  error: { marginTop: rs(spacing.md) },
  hint: { marginTop: rs(spacing.md) },
  change: { alignSelf: 'flex-start', marginTop: rs(spacing.sm) },
  footer: { gap: spacing.xs },
});
