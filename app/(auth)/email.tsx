import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BackButton, Button, Screen, SearchInput, Text } from '@/components/ui';
import { authErrorKey, useEmailCode } from '@/features/auth/useAuth';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import { isValidEmail } from '@/utils/email';

/** Email entry for the passwordless sign in (not in the PDF). */
export default function EmailScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { request } = useEmailCode();
  const valid = isValidEmail(email);

  const submit = useCallback(async () => {
    if (!valid) {
      setError(t('email.invalid'));
      return;
    }
    setError(null);
    try {
      await request.mutateAsync(email.trim());
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email.trim(), ...(next ? { next } : {}) },
      } as Href);
    } catch (caught) {
      const key = authErrorKey(caught);
      if (key) setError(t(key));
    }
  }, [email, request, router, t, valid, next]);

  return (
    <Screen
      header={<BackButton onPress={() => router.back()} label={t('a11y.backButton')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('email.sendCode')}
          onPress={() => void submit()}
          disabled={!valid}
          loading={request.isPending}
          haptic="medium"
        />
      }
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('email.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('email.subtitle')}
      </Text>
      <View style={styles.field}>
        <SearchInput
          icon="mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError(null);
          }}
          placeholder={t('email.placeholder')}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoFocus
          returnKeyType="send"
          onSubmitEditing={() => void submit()}
          clearLabel={t('common.clear')}
        />
        {error ? (
          <Text
            variant="small"
            color="danger"
            style={styles.error}
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  field: { marginTop: rv(layout.subtitleToContent) },
  error: { marginTop: rs(spacing.sm) },
});
