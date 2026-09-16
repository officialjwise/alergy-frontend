import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingScreen, useQuestionCopy } from '@/components/onboarding/OnboardingScreen';
import { Button, WheelPicker } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing } from '@/theme/tokens';
import { rv } from '@/theme/responsive';
import type { BirthDate } from '@/types';
import { daysInMonth, isValidBirthDate } from '@/utils/date';

/** The PDF shows June 15, 2001 selected; that is the initial wheel position. */
const DEFAULT_DATE: BirthDate = { year: 2001, month: 6, day: 15 };

export default function BirthScreen() {
  const { t, i18n } = useTranslation();
  const copy = useQuestionCopy();
  const birthDate = useOnboardingStore((state) => state.answers.birthDate);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const value = birthDate ?? DEFAULT_DATE;

  // The wheel always shows a date, so the shown date is the answer.
  useEffect(() => {
    if (!birthDate) setAnswer('birthDate', DEFAULT_DATE);
  }, [birthDate, setAnswer]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: 'long' }),
      })),
    [i18n.language],
  );
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({ length: 110 }, (_, index) => ({
        value: currentYear - index,
        label: String(currentYear - index),
      })),
    [currentYear],
  );
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth(value.year, value.month) }, (_, index) => ({
        value: index + 1,
        label: String(index + 1),
      })),
    [value.month, value.year],
  );

  const update = (patch: Partial<BirthDate>) => {
    const next = { ...value, ...patch };
    next.day = Math.min(next.day, daysInMonth(next.year, next.month));
    setAnswer('birthDate', next);
  };

  return (
    <OnboardingScreen
      route="birth"
      title={copy('birth.title')}
      subtitle={t('birth.subtitle')}
      footer={(nav) => (
        <Button
          title={t('common.continue')}
          onPress={nav.goNext}
          disabled={!isValidBirthDate(birthDate)}
          haptic="medium"
        />
      )}
    >
      <View style={styles.picker} accessibilityLabel={t('birth.a11yPicker')}>
        <WheelPicker
          columns={[
            {
              accessibilityLabel: t('birth.month'),
              align: 'left',
              flex: 1.55,
              items: months,
              value: value.month,
              onChange: (month) => update({ month }),
            },
            {
              accessibilityLabel: t('birth.day'),
              flex: 0.85,
              items: days,
              value: value.day,
              onChange: (day) => update({ day }),
            },
            {
              accessibilityLabel: t('birth.year'),
              flex: 1.1,
              items: years,
              value: value.year,
              onChange: (year) => update({ year }),
            },
          ]}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  picker: { marginTop: rv(spacing.huge) },
});
