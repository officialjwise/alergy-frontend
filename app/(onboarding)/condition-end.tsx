import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, Text, WheelPicker } from '@/components/ui';
import { stepKey } from '@/features/onboarding/steps';
import { useOnboardingStore } from '@/store/onboardingStore';
import { layout, spacing } from '@/theme/tokens';
import { rs, rv } from '@/theme/responsive';
import type { HealthConditionId } from '@/types';
import { daysInMonth } from '@/utils/date';

/**
 * Question 11 (optional): when is [condition] expected to end? Two weeks after
 * that date the app asks whether it still applies; advice never switches off
 * by itself.
 */
export default function ConditionEndScreen() {
  const { t, i18n } = useTranslation();
  const copy = useQuestionCopy();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conditionId = (id ?? 'pregnancy') as HealthConditionId;
  const ends = useOnboardingStore((state) => state.answers.conditionEnds[conditionId]);
  const setConditionEnd = useOnboardingStore((state) => state.setConditionEnd);
  // Read the clock once per mount so the memoised year list stays stable.
  const [today] = useState(() => new Date());
  const initial = ends ? ends.split('-').map(Number) : null;
  const [year, setYear] = useState(initial?.[0] ?? today.getFullYear());
  const [month, setMonth] = useState(initial?.[1] ?? today.getMonth() + 1);
  const [day, setDay] = useState(initial?.[2] ?? today.getDate());

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'long' }) })),
    [i18n.language],
  );
  const days = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, index) => ({ value: index + 1, label: String(index + 1) })), [month, year]);
  const years = useMemo(() => Array.from({ length: 3 }, (_, index) => ({ value: today.getFullYear() + index, label: String(today.getFullYear() + index) })), [today]);

  const save = () => {
    const clamped = Math.min(day, daysInMonth(year, month));
    setConditionEnd(conditionId, `${year}-${String(month).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`);
  };

  return (
    <OnboardingScreen
      route={stepKey('condition-end', conditionId)}
      title={copy('q11.title', { condition: t(`conditions.${conditionId}`).toLowerCase() })}
      subtitle={conditionId === 'pregnancy' ? t('q11.subtitlePregnancy') : t('q11.subtitle')}
      footer={(nav) => (
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => {
              save();
              nav.goNext();
            }}
            haptic="medium"
          />
          <Button
            title={t('common.skip')}
            variant="text"
            onPress={() => {
              setConditionEnd(conditionId, null);
              nav.goNext();
            }}
          />
        </View>
      )}
    >
      <View style={styles.picker}>
        <WheelPicker
          columns={[
            { accessibilityLabel: t('birth.month'), align: 'left', flex: 1.55, items: months, value: month, onChange: setMonth },
            { accessibilityLabel: t('birth.day'), flex: 0.85, items: days, value: day, onChange: setDay },
            { accessibilityLabel: t('birth.year'), flex: 1.1, items: years, value: year, onChange: setYear },
          ]}
        />
      </View>
      <Text variant="small" color="textMuted" style={styles.note}>
        {t('q11.note')}
      </Text>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: rv(layout.subtitleToContent) },
  note: { marginTop: rs(spacing.lg) },
  footer: { gap: spacing.xs },
});
