import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Button, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { useEmailCode } from '@/features/auth/useAuth';
import { layout, spacing } from '@/theme/tokens';
import { rv } from '@/theme/responsive';
import { isValidEmail } from '@/utils/email';

/** Passwordless email change: send a code to the new address, then verify it. */
export default function ChangeEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { request } = useEmailCode();
  const valid = isValidEmail(email.trim());

  const send = () => {
    request.mutate(email.trim(), {
      onSuccess: () => router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } }),
      onError: () => showToast({ message: t('states.errorTitle'), icon: 'alert' }),
    });
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.changeEmail.title')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('settingsScreens.changeEmail.send')}
          onPress={send}
          disabled={!valid}
          loading={request.isPending}
          haptic="medium"
          testID="change-email-send"
        />
      }
      testID="settings-change-email"
    >
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('settingsScreens.changeEmail.subtitle')}
      </Text>
      <TextField
        label={t('settingsScreens.changeEmail.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('settingsScreens.changeEmail.placeholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        error={email.length > 3 && !valid ? t('settingsScreens.changeEmail.invalid') : undefined}
        style={styles.field}
        testID="change-email-input"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: rv(layout.titleTop / 2) },
  field: { marginTop: rv(spacing.xl) },
});
