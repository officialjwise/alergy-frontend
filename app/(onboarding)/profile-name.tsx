import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, SearchInput } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rv } from '@/theme/responsive';

/** Optional name for a child / family member profile (not in the PDF, same layout as the search screen). */
export default function ProfileNameScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const name = useOnboardingStore((state) => state.answers.profileName);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  return (
    <OnboardingScreen
      route="profile-name"
      title={copy('profileName.title')}
      subtitle={t('profileName.subtitle')}
      keyboardAvoiding
      footer={(nav) => (
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={nav.goNext}
            disabled={name.trim().length === 0}
            haptic="medium"
          />
          <Button
            title={t('profileName.skip')}
            variant="text"
            onPress={() => {
              setAnswer('profileName', '');
              nav.goNext();
            }}
          />
        </View>
      )}
    >
      <View style={styles.field}>
        <SearchInput
          icon="person"
          value={name}
          onChangeText={(value) => setAnswer('profileName', value)}
          placeholder={t('profileName.placeholder')}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          maxLength={40}
          clearLabel={t('common.clear')}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: rv(layout.subtitleToContent) },
  footer: { gap: spacing.xs },
});
