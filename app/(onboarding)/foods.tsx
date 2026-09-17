import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button } from '@/components/ui';
import { FoodPicker } from '@/features/questionnaire/components/FoodPicker';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout } from '@/theme/tokens';
import { rv } from '@/theme/responsive';

/** Question 3: which of these does [name] need to avoid? Picking is optional; question 4 covers the rest. */
export default function FoodsScreen() {
  const { t } = useTranslation();
  const copy = useQuestionCopy();
  const picked = useOnboardingStore((state) => state.answers.pickedFoods);
  const togglePicked = useOnboardingStore((state) => state.togglePicked);
  return (
    <OnboardingScreen
      route="foods"
      title={copy('q3.title')}
      subtitle={t('q3.subtitle')}
      footer={(nav) => <Button title={t('common.continue')} onPress={nav.goNext} haptic="medium" />}
    >
      <View style={styles.list}>
        <FoodPicker selected={picked} onToggle={togglePicked} />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ list: { marginTop: rv(layout.subtitleToContent) } });
