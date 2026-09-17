import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Icon,
  NavHeader,
  PressableScale,
  Screen,
  SegmentedControl,
  showToast,
  Text,
  type IconName,
} from '@/components/ui';
import { lbsToKg } from '@/features/tracking/nutrition';
import { useBodyMetrics, useLogWorkout } from '@/features/tracking/useTracking';
import { selectActiveProfile, useProfileStore } from '@/store/profileStore';
import { borders, colors, radii, sizes, spacing } from '@/theme/tokens';
import { rs } from '@/theme/responsive';
import type { WorkoutKind } from '@/types';

type Intensity = 'low' | 'medium' | 'high';

const KINDS: { kind: WorkoutKind; icon: IconName; met: number }[] = [
  { kind: 'run', icon: 'run', met: 9.8 },
  { kind: 'walk', icon: 'steps', met: 3.5 },
  { kind: 'cycle', icon: 'bike', met: 7.5 },
  { kind: 'strength', icon: 'dumbbell', met: 5 },
  { kind: 'yoga', icon: 'yoga', met: 3 },
  { kind: 'swim', icon: 'swim', met: 7 },
  { kind: 'hiit', icon: 'hiit', met: 10 },
  { kind: 'other', icon: 'pulse', met: 5 },
];

const INTENSITY_FACTOR: Record<Intensity, number> = { low: 0.8, medium: 1, high: 1.2 };
const FALLBACK_WEIGHT_LBS = 150;
const STEP_MINUTES = 5;

/** Log exercise: pick a workout, set the minutes and intensity, see the estimate and log it. */
export default function LogExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfileStore(selectActiveProfile);
  const body = useBodyMetrics();
  const log = useLogWorkout();
  const [kind, setKind] = useState<WorkoutKind>('run');
  const [minutes, setMinutes] = useState(30);
  const [intensity, setIntensity] = useState<Intensity>('medium');

  const calories = useMemo(() => {
    const met = KINDS.find((item) => item.kind === kind)?.met ?? 5;
    const kg = lbsToKg(body.currentWeightLbs ?? FALLBACK_WEIGHT_LBS);
    return Math.round(met * kg * (minutes / 60) * INTENSITY_FACTOR[intensity]);
  }, [body.currentWeightLbs, intensity, kind, minutes]);

  const submit = useCallback(async () => {
    if (!profile) return;
    try {
      await log.mutateAsync({
        profileId: profile.id,
        kind,
        name: t(`exercise.kind_${kind}`),
        minutes,
        calories,
      });
      showToast({ message: t('exercise.logged', { count: calories }), icon: 'flame' });
      router.back();
    } catch {
      showToast({ message: t('states.errorTitle'), icon: 'alert' });
    }
  }, [calories, kind, log, minutes, profile, router, t]);

  const intensityOptions = useMemo(
    () =>
      (['low', 'medium', 'high'] as const).map((key) => ({
        key,
        label: t(`exercise.intensity_${key}`),
      })),
    [t],
  );

  return (
    <Screen
      header={<NavHeader title={t('exercise.title')} />}
      footer={
        <Button
          title={t('exercise.log')}
          onPress={() => void submit()}
          loading={log.isPending}
          haptic="medium"
        />
      }
      testID="log-exercise"
    >
      <Text variant="sectionLabel" color="textMuted" style={styles.label}>
        {t('exercise.kind')}
      </Text>
      <View style={styles.grid}>
        {KINDS.map((item) => {
          const selected = item.kind === kind;
          return (
            <PressableScale
              key={item.kind}
              onPress={() => setKind(item.kind)}
              haptic="selection"
              pressedScale={0.96}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={t(`exercise.kind_${item.kind}`)}
              style={[styles.kind, selected ? styles.kindSelected : null]}
              testID={`exercise-${item.kind}`}
            >
              <Icon name={item.icon} size={rs(24)} color={selected ? 'onPrimary' : 'text'} />
              <Text variant="small" color={selected ? 'onPrimary' : 'textBody'} numberOfLines={1}>
                {t(`exercise.kind_${item.kind}`)}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Text variant="sectionLabel" color="textMuted" style={styles.label}>
        {t('exercise.duration')}
      </Text>
      <View style={styles.stepper}>
        <PressableScale
          onPress={() => setMinutes((current) => Math.max(STEP_MINUTES, current - STEP_MINUTES))}
          haptic="selection"
          pressedScale={0.94}
          accessibilityRole="button"
          accessibilityLabel={t('exercise.less')}
          style={styles.step}
        >
          <Icon name="minus" size={rs(22)} color="text" />
        </PressableScale>
        <Text variant="stat" color="text" style={styles.minutes}>
          {t('exercise.minutes', { count: minutes })}
        </Text>
        <PressableScale
          onPress={() => setMinutes((current) => Math.min(600, current + STEP_MINUTES))}
          haptic="selection"
          pressedScale={0.94}
          accessibilityRole="button"
          accessibilityLabel={t('exercise.more')}
          style={styles.step}
        >
          <Icon name="plus" size={rs(22)} color="text" />
        </PressableScale>
      </View>

      <Text variant="sectionLabel" color="textMuted" style={styles.label}>
        {t('exercise.intensity')}
      </Text>
      <SegmentedControl options={intensityOptions} value={intensity} onChange={setIntensity} />

      <View style={styles.estimate} accessible accessibilityLiveRegion="polite">
        <Icon name="flame" size={rs(22)} color="flame" />
        <Text variant="label" color="text">
          {t('exercise.estimate', { count: calories })}
        </Text>
      </View>
      <Text variant="small" color="textMuted">
        {t('exercise.estimateNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: rs(spacing.xl), marginBottom: rs(spacing.sm) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(spacing.xs) },
  kind: {
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    gap: rs(4),
    paddingVertical: rs(spacing.sm),
    borderRadius: radii.card,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  kindSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: rs(spacing.md) },
  step: {
    width: rs(sizes.backButton),
    height: rs(sizes.backButton),
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutes: { flex: 1, textAlign: 'center' },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(spacing.xs),
    marginTop: rs(spacing.xl),
    marginBottom: rs(spacing.xs),
  },
});
