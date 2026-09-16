import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { Button, WorksForYouBadge } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const cameraScan = require('@/assets/images/camera-scan.jpg');

/** "Would you like to scan foods with your camera?" - photo card, Yes button, No text button. */
export default function CameraScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const setAnswer = useOnboardingStore((state) => state.setAnswer);

  const cardWidth = Math.min(width - rs(layout.screenPaddingH) * 2 - rs(16), 420);
  const cardHeight = Math.round(cardWidth * (450 / 590));

  return (
    <OnboardingScreen
      route="camera"
      title={t('camera.title')}
      subtitle={t('camera.subtitle')}
      footer={(nav) => (
        <View style={styles.footer}>
          <Button
            title={t('common.yes')}
            haptic="medium"
            onPress={() => {
              setAnswer('cameraScanning', true);
              nav.goNext();
            }}
          />
          <Button
            title={t('common.no')}
            variant="text"
            onPress={() => {
              setAnswer('cameraScanning', false);
              nav.goNext();
            }}
          />
        </View>
      )}
    >
      <View
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('camera.imageA11y')}
      >
        <Image
          source={cameraScan}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          priority="high"
        />
        <WorksForYouBadge
          label={t('welcome.badge')}
          style={[
            styles.badge,
            { right: Math.round(cardWidth * 0.04), top: Math.round(cardHeight * 0.16) },
          ]}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    marginTop: rv(spacing.xl),
    borderRadius: radii.xl,
    overflow: 'visible',
    backgroundColor: colors.surfaceTint,
  },
  badge: { position: 'absolute' },
  footer: { gap: spacing.xs },
});
