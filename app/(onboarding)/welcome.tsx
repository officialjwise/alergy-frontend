import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  IconChip,
  PressableScale,
  Screen,
  ScanFrame,
  Text,
  WorksForYouBadge,
  useSheetRef,
  type IconName,
} from '@/components/ui';
import { LanguageSheet } from '@/features/onboarding/components/LanguageSheet';
import { stepHref } from '@/features/onboarding/navigation';
import { FIRST_STEP } from '@/features/onboarding/steps';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, layout, radii, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const heroBowl = require('@/assets/images/hero-bowl.png');

const FEATURES: { icon: IconName; key: 'featureScan' | 'featureCheck' | 'featureConfidence' }[] = [
  { icon: 'camera', key: 'featureScan' },
  { icon: 'leaf', key: 'featureCheck' },
  { icon: 'shieldCheck', key: 'featureConfidence' },
];

/** Screen 1 of the PDF: headline, subtitle, hero bowl with scan frame + badge, three features, Get Started. */
export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const sheetRef = useSheetRef();
  const languageChosen = useAppStore((state) => state.language) !== null;
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const proceedAfterSheet = useRef(false);

  const start = useCallback(() => {
    setCurrentStep(FIRST_STEP);
    router.push(stepHref(FIRST_STEP));
  }, [router, setCurrentStep]);

  const onGetStarted = useCallback(() => {
    if (languageChosen) {
      start();
      return;
    }
    proceedAfterSheet.current = true;
    sheetRef.current?.present();
  }, [languageChosen, sheetRef, start]);

  const onSheetDismiss = useCallback(() => {
    if (proceedAfterSheet.current) {
      proceedAfterSheet.current = false;
      start();
    }
  }, [start]);

  const heroSize = Math.min(width - rs(layout.screenPaddingH) * 2, 420);
  const frameInset = Math.round(heroSize * 0.11);
  const bowlSize = Math.round(heroSize * 0.74);

  return (
    <Screen
      scrollProps={{ bounces: false }}
      footer={
        <View style={styles.footer}>
          <Button title={t('common.getStarted')} onPress={onGetStarted} haptic="medium" />
          <PressableScale
            onPress={() => router.push('/(auth)/sign-in')}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel={t('welcome.signIn')}
            style={styles.signIn}
            testID="welcome-sign-in"
          >
            <Text variant="body" color="textMuted">
              {t('welcome.haveAccount')}{' '}
              <Text variant="bodyStrong" color="text">
                {t('welcome.signIn')}
              </Text>
            </Text>
          </PressableScale>
        </View>
      }
    >
      <View style={{ height: rv(40) }} />
      <Text variant="display" color="text" accessibilityRole="header">
        {t('welcome.title')}
      </Text>
      <Text variant="subtitle" color="textMuted" style={styles.subtitle}>
        {t('welcome.subtitle')}
      </Text>

      <View
        style={[styles.hero, { width: heroSize, height: heroSize }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('welcome.heroA11y')}
      >
        <Image
          source={heroBowl}
          style={{ width: bowlSize, height: bowlSize }}
          contentFit="contain"
          transition={200}
          priority="high"
        />
        <ScanFrame style={{ margin: frameInset }} />
        <WorksForYouBadge
          label={t('welcome.badge')}
          style={[
            styles.badge,
            { right: Math.round(heroSize * 0.09), top: Math.round(heroSize * 0.35) },
          ]}
        />
      </View>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <View key={feature.key} style={styles.feature}>
            <IconChip icon={feature.icon} size={64} iconSize={28} outline />
            <Text
              variant="caption"
              color="textSecondary"
              align="center"
              style={styles.featureLabel}
            >
              {t(`welcome.${feature.key}`)}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: Math.max(insets.bottom, spacing.md) }} />

      <LanguageSheet ref={sheetRef} onDismiss={onSheetDismiss} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { gap: rs(spacing.xs) },
  signIn: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  subtitle: { marginTop: rs(spacing.sm) },
  hero: {
    alignSelf: 'center',
    marginTop: rv(spacing.lg),
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute' },
  features: { flexDirection: 'row', marginTop: rv(spacing.xl), justifyContent: 'space-between' },
  feature: { flex: 1, alignItems: 'center', gap: rs(spacing.xs) },
  featureLabel: { marginTop: rs(2) },
});
