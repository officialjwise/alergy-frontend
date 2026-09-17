import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Button, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** "Confirm your name": first and last name, the name others see in groups. */
export default function ConfirmNameScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const account = useAppStore((state) => state.account);
  const setAccount = useAppStore((state) => state.setAccount);
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [firstName, lastName] = splitName(account.name);
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const valid = first.trim().length > 0 && last.trim().length > 0;

  const save = () => {
    const name = `${first.trim()} ${last.trim()}`;
    const username = account.username || `${first.trim()}${last.trim()}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setAccount({ name, username });
    if (profile && profile.profileFor === 'myself') updateProfile(profile.id, { name: first.trim() });
    showToast({ message: t('settingsScreens.name.saved'), icon: 'checkCircle' });
    router.back();
  };

  return (
    <Screen
      header={<NavHeader />}
      keyboardAvoiding
      footer={
        <Button
          title={t('common.continue')}
          onPress={save}
          disabled={!valid}
          haptic="medium"
          testID="name-save"
        />
      }
      testID="settings-name"
    >
      <Text variant="title" color="text" style={styles.title} accessibilityRole="header">
        {t('settingsScreens.name.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('settingsScreens.name.subtitle')}
      </Text>
      <TextField
        value={first}
        onChangeText={setFirst}
        placeholder={t('settingsScreens.name.firstName')}
        autoCapitalize="words"
        autoFocus
        style={styles.field}
        accessibilityLabel={t('settingsScreens.name.firstName')}
        testID="first-name-input"
      />
      <TextField
        value={last}
        onChangeText={setLast}
        placeholder={t('settingsScreens.name.lastName')}
        autoCapitalize="words"
        style={styles.field}
        accessibilityLabel={t('settingsScreens.name.lastName')}
        testID="last-name-input"
      />
    </Screen>
  );
}

function splitName(name: string): [string, string] {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ['', ''];
  return [parts[0] ?? '', parts.slice(1).join(' ')];
}

const styles = StyleSheet.create({
  title: { marginTop: rs(spacing.md) },
  subtitle: { marginTop: rs(spacing.xs), marginBottom: rs(spacing.sm) },
  field: { marginTop: rs(spacing.md) },
});
