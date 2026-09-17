import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Button, NavHeader, Screen, showToast, Text, TextField } from '@/components/ui';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';

/** Question 12 outside onboarding: the note kept with the profile. */
export default function NoteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [note, setNote] = useState(profile?.note ?? '');
  const save = () => {
    if (!profile) return;
    updateProfile(profile.id, { note: note.trim() });
    showToast({ message: t('noteScreen.saved'), icon: 'checkCircle' });
    router.back();
  };
  return (
    <Screen
      header={<NavHeader title={t('noteScreen.title')} />}
      keyboardAvoiding
      footer={<Button title={t('common.save')} onPress={save} haptic="medium" disabled={(profile?.note ?? '') === note.trim()} />}
      testID="settings-note"
    >
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder={t('q12.placeholder')}
        multiline
        maxLength={200}
        autoFocus
        style={styles.field}
        accessibilityLabel={t('noteScreen.title')}
      />
      <Text variant="small" color="textMuted" style={styles.privacy}>
        {t('q12.privacy')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: rs(spacing.lg) },
  privacy: { marginTop: rs(spacing.sm) },
});
