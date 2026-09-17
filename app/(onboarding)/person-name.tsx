import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, SearchInput } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout } from '@/theme/tokens';
import { rv } from '@/theme/responsive';

/** Question 1, "Someone else": the app asks for their name and creates a profile for them. */
export default function PersonNameScreen() {
  const { t } = useTranslation();
  const name = useOnboardingStore((state) => state.answers.personName);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  return (
    <OnboardingScreen
      route="person-name"
      title={t('q1.nameTitle')}
      subtitle={t('q1.nameSubtitle')}
      keyboardAvoiding
      footer={(nav) => (
        <Button
          title={t('common.continue')}
          onPress={nav.goNext}
          disabled={name.trim().length === 0}
          haptic="medium"
        />
      )}
    >
      <View style={styles.field}>
        <SearchInput
          icon="person"
          value={name}
          onChangeText={(value) => setAnswer('personName', value)}
          placeholder={t('q1.namePlaceholder')}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          returnKeyType="done"
          maxLength={40}
          clearLabel={t('common.clear')}
          testID="person-name-input"
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ field: { marginTop: rv(layout.subtitleToContent) } });
