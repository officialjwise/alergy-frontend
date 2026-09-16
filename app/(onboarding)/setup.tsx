import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import {
  Card,
  Divider,
  Icon,
  RadioCheck,
  ReText,
  Spinner,
  Text,
  type IconName,
} from '@/components/ui';
import { useOnboardingNav } from '@/features/onboarding/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';

const STEPS: { key: 'watchlist' | 'caution' | 'diet' | 'scan'; icon: IconName; at: number }[] = [
  { key: 'watchlist', icon: 'document', at: 30 },
  { key: 'caution', icon: 'shieldCheck', at: 55 },
  { key: 'diet', icon: 'restaurant', at: 78 },
  { key: 'scan', icon: 'barcode', at: 100 },
];

const DURATION = 4200;
const HOLD_AT_END = 600;

/**
 * "78% - We're setting everything up for you": animated percentage (UI
 * thread), green gradient bar, and a checklist that ticks off step by step.
 * Moves on automatically when it reaches 100%.
 */
export default function SetupScreen() {
  const { t } = useTranslation();
  const markSetupDone = useOnboardingStore((state) => state.markSetupDone);
  const { goNext } = useOnboardingNav('setup');
  const progress = useSharedValue(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    progress.value = withTiming(100, { duration: DURATION, easing: Easing.inOut(Easing.cubic) });
  }, [progress]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (next, previous) => {
      if (next !== previous) runOnJS(setPercent)(next);
    },
  );

  useEffect(() => {
    if (percent < 100) return;
    markSetupDone();
    const handle = setTimeout(goNext, HOLD_AT_END);
    return () => clearTimeout(handle);
  }, [goNext, markSetupDone, percent]);

  const label = useDerivedValue(() => `${Math.round(progress.value)}%`);
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <OnboardingScreen route="setup" header={false}>
      <View style={styles.body}>
        <ReText
          text={label}
          style={styles.percent}
          accessibilityLabel={t('setup.progressA11y', { percent })}
        />
        <Text variant="statement" color="text" style={styles.statement} accessibilityRole="header">
          {t('setup.title')}
        </Text>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: percent }}
        >
          <Animated.View style={[styles.fill, barStyle]}>
            <LinearGradient
              colors={[colors.successBright, colors.successBright, colors.successSoft]}
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <Card title={t('setup.card')} variant="outlined" style={styles.card}>
          {STEPS.map((step, index) => {
            const done = percent >= step.at;
            return (
              <View key={step.key}>
                <View
                  style={styles.row}
                  accessible
                  accessibilityLabel={`${t(`setup.${step.key}`)}, ${done ? t('common.done') : t('common.loading')}`}
                >
                  <View style={styles.rowIcon}>
                    <Icon name={step.icon} size={rs(sizes.icon)} color="text" outline />
                  </View>
                  <Text variant="body" color="textBody" style={styles.rowLabel}>
                    {t(`setup.${step.key}`)}
                  </Text>
                  {done ? <RadioCheck selected /> : <Spinner />}
                </View>
                {index < STEPS.length - 1 ? <Divider /> : null}
              </View>
            );
          })}
        </Card>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: rv(spacing.giant) },
  percent: {
    fontFamily: 'Inter_700Bold',
    fontSize: rs(60),
    lineHeight: rs(68),
    letterSpacing: -1,
    color: colors.text,
  },
  statement: { marginTop: rs(spacing.md) },
  track: {
    height: sizes.loadingBar,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    marginTop: rv(spacing.xl),
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, overflow: 'hidden' },
  card: { marginTop: rv(spacing.xl) },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: rs(72), gap: rs(spacing.md) },
  rowIcon: { width: rs(sizes.icon), alignItems: 'center' },
  rowLabel: { flex: 1 },
});
