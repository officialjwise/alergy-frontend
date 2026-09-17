import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button } from '@/components/ui';
import { TypedFoods } from '@/features/questionnaire/components/TypedFoods';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rv } from '@/theme/responsive';

/** Question 4: anything else [name] needs to avoid that isn't in the list? Optional, up to 10. */
export default function FoodsOtherScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const typed = useOnboardingStore((state) => state.answers.typedFoods);
  const addTyped = useOnboardingStore((state) => state.addTyped);
  const removeTyped = useOnboardingStore((state) => state.removeTyped);
  return (
    <OnboardingScreen
      route="foods-other"
      title={copy('q4.title')}
      subtitle={t('q4.subtitle')}
      keyboardAvoiding
      footer={(nav) => (
        <View style={styles.footer}>
          <Button title={t('common.continue')} onPress={nav.goNext} haptic="medium" />
        </View>
      )}
    >
      <View style={styles.body}>
        <TypedFoods foods={typed} onAdd={addTyped} onRemove={removeTyped} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: rv(layout.subtitleToContent) },
  footer: { gap: spacing.xs },
});
