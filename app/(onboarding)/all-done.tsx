import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const illustration = require('@/assets/images/all-done.png');

/** "All done! Time to generate your personalized food profile." */
export default function AllDoneScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const illustrationWidth = Math.min(width * 0.78, 340);

  return (
    <OnboardingScreen
      route="all-done"
      footer={(nav) => <Button title={t('common.continue')} onPress={nav.goNext} haptic="medium" />}
    >
      <View style={styles.body}>
        <Image
          source={illustration}
          style={{ width: illustrationWidth, height: illustrationWidth * (455 / 545) }}
          contentFit="contain"
          accessibilityLabel={t('allDone.illustrationA11y')}
          accessible
        />
        <Text variant="bodyLg" color="textBody" align="center" style={styles.caption}>
          {t('allDone.caption')}
        </Text>
        <Text
          variant="titleLg"
          color="text"
          align="center"
          style={styles.title}
          accessibilityRole="header"
        >
          {t('allDone.title')}
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: rv(spacing.huge),
  },
  caption: { marginTop: rv(spacing.xl) },
  title: { marginTop: rs(spacing.sm), paddingHorizontal: spacing.md },
});
