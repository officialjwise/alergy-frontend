import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, Text, TextField } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

/** Question 12 (optional): anything else to keep with [name]'s profile? Only the account holder sees it. */
export default function NoteScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const note = useOnboardingStore((state) => state.answers.note);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  return (
    <OnboardingScreen
      route="note"
      title={copy('q12.title')}
      subtitle={t('q12.subtitle')}
      keyboardAvoiding
      footer={(nav) => (
        <View style={styles.footer}>
          <Button title={t('common.continue')} onPress={nav.goNext} haptic="medium" />
          {!note.trim() ? <Button title={t('common.skip')} variant="text" onPress={nav.goNext} /> : null}
        </View>
      )}
    >
      <View style={styles.field}>
        <TextField
          value={note}
          onChangeText={(value) => setAnswer('note', value)}
          placeholder={t('q12.placeholder')}
          multiline
          maxLength={200}
          accessibilityLabel={t('q12.title')}
          testID="note-input"
        />
        <Text variant="small" color="textMuted" style={styles.privacy}>
          {t('q12.privacy')}
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: rv(layout.subtitleToContent) },
  privacy: { marginTop: rs(spacing.sm) },
  footer: { gap: spacing.xs },
});
