import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Button, NavHeader, Screen, showToast, TextField } from '@/components/ui';
import { useAppStore } from '@/store/appStore';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

const USERNAME = /^[a-z0-9_]{0,24}$/i;

/** Edit the display name and username shown on the profile header. */
export default function EditNameScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const account = useAppStore((state) => state.account);
  const setAccount = useAppStore((state) => state.setAccount);
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [name, setName] = useState(account.name || profile?.name || '');
  const [username, setUsername] = useState(account.username);

  const validUsername = USERNAME.test(username);
  const dirty = name.trim() !== account.name || username.trim() !== account.username;

  const save = () => {
    setAccount({ name: name.trim(), username: username.trim().toLowerCase() });
    if (profile && profile.profileFor === 'myself' && name.trim())
      updateProfile(profile.id, { name: name.trim() });
    showToast({ message: t('settingsScreens.name.saved'), icon: 'checkCircle' });
    router.back();
  };

  return (
    <Screen
      header={<NavHeader title={t('settingsScreens.name.title')} />}
      keyboardAvoiding
      footer={
        <Button
          title={t('settingsScreens.name.save')}
          onPress={save}
          disabled={!dirty || !validUsername || !name.trim()}
          haptic="medium"
          testID="name-save"
        />
      }
      testID="settings-name"
    >
      <TextField
        label={t('settingsScreens.name.name')}
        value={name}
        onChangeText={setName}
        placeholder={t('settingsScreens.name.namePlaceholder')}
        autoCapitalize="words"
        autoFocus
        style={styles.field}
        testID="name-input"
      />
      <TextField
        label={t('settingsScreens.name.username')}
        value={username}
        onChangeText={(value) => setUsername(value.replace(/^@/, ''))}
        placeholder={t('settingsScreens.name.usernamePlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        helper={validUsername ? t('settingsScreens.name.usernameHint') : undefined}
        error={validUsername ? undefined : t('settingsScreens.name.usernameHint')}
        style={styles.field}
        testID="username-input"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ field: { marginTop: rs(spacing.lg) } });
