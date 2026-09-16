import { useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ProgressHeader, Screen, Text } from '@/components/ui';
import { useOnboardingNav, type OnboardingNav } from '@/features/onboarding/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

export interface OnboardingScreenProps {
  route: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode | ((nav: OnboardingNav) => ReactNode);
  footer?: ReactNode | ((nav: OnboardingNav) => ReactNode);
  /** Hide the back button / progress bar (loading, summary screens). */
  header?: boolean;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  bleed?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Centers the title (All done, Time to generate). */
  centered?: boolean;
  onFinish?: () => void;
  testID?: string;
}

/**
 * Shared chrome for every onboarding step: progress header, 36pt title,
 * 20pt subtitle and the pinned footer. Persists the step for resume.
 */
export function OnboardingScreen({
  route,
  title,
  subtitle,
  children,
  footer,
  header = true,
  scroll = true,
  keyboardAvoiding = false,
  bleed = false,
  contentStyle,
  centered = false,
  onFinish,
  testID,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const nav = useOnboardingNav(route, onFinish);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep(route);
    }, [route, setCurrentStep]),
  );

  return (
    <Screen
      header={
        header ? (
          <ProgressHeader
            progress={nav.position.progress}
            onBack={nav.goBack}
            backLabel={t('a11y.backButton')}
            progressLabel={t('a11y.progress', {
              current: nav.position.index + 1,
              total: nav.position.total,
            })}
          />
        ) : null
      }
      footer={typeof footer === 'function' ? footer(nav) : footer}
      scroll={scroll}
      keyboardAvoiding={keyboardAvoiding}
      bleed={bleed}
      contentStyle={contentStyle}
      testID={testID ?? `onboarding-${route}`}
    >
      {title ? (
        <View style={bleed ? styles.bleedTitle : null}>
          <Text
            variant="title"
            color="text"
            style={styles.title}
            align={centered ? 'center' : undefined}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              variant="subtitle"
              color="textMuted"
              style={styles.subtitle}
              align={centered ? 'center' : undefined}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {typeof children === 'function' ? children(nav) : children}
    </Screen>
  );
}

export function useQuestionCopy() {
  const { t } = useTranslation();
  const profileFor = useOnboardingStore((state) => state.answers.profileFor) ?? 'myself';
  return useCallback((key: string) => t(key, { context: profileFor }), [profileFor, t]);
}

const styles = StyleSheet.create({
  title: { marginTop: rv(layout.titleTop) },
  subtitle: { marginTop: rs(layout.titleToSubtitle) },
  bleedTitle: { paddingHorizontal: rs(layout.screenPaddingH) },
});
